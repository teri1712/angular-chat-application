import {Component, computed, effect, inject, signal, untracked, ViewChild} from '@angular/core';
import {CdkVirtualScrollViewport, ScrollingModule} from "@angular/cdk/scrolling";
import {CommonModule} from "@angular/common";
import {ConversationComponent} from "../dialog/conversation.component";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {catchError, map, Observable, of, switchMap} from "rxjs";
import {ConversationRepository} from "../../service/repository/conversation-repository.service";
import {InboxLog, LogAction} from "../../model/dto/inbox-log";
import {LogStream} from "../../service/repository/log-stream.service";
import {MessageState} from "../../model/dto/message-state";
import CacheStore from "../../service/cache/data/cache-service";
import {Conversation} from "../../model/dto/Conversation";
import {PresenceMap, PresenceRepository} from "../../service/repository/presence-repository.service";

@Component({
    selector: 'app-conversation-list',
    imports: [
        ScrollingModule,
        CommonModule,
        ConversationComponent,
        MatProgressSpinner,
    ],
    templateUrl: './conversation-list.component.html',
    styleUrl: './conversation-list.component.css'
})
export class ConversationListComponent {

    @ViewChild('viewport') viewport!: CdkVirtualScrollViewport;

    private readonly scrollIndex = signal(0);

    protected onScrollChanged(index: number) {
        this.scrollIndex.set(index);
    }

    private readonly displayedConversations: Conversations = new RevisionList();
    private readonly presences: PresenceMap = {}
    private readonly history: History = new RevisionList();

    protected expanding = signal(false);
    protected end = signal(false);

    private readonly repository = inject(ConversationRepository)
    private readonly presenceRepo = inject(PresenceRepository)
    private readonly cacheStore = inject(CacheStore)
    private readonly logStream = inject(LogStream)

    constructor() {

        this.definePrependingPipe();
        this.defineAppendingPipe();
        this.defineExpandPipe();
    }

    private presenceOf(chatId: string): Date {
        return new Date(this.presences[chatId]?.at ?? 0);
    }

    mapLog(log: InboxLog): ConversationView {
        const message = log.messageState;
        return {
            roomName: log.roomName,
            roomAvatar: log.roomAvatar,
            chatId: log.chatId,
            presence: this.presenceOf(log.chatId),
            revisionNumber: log.revisionNumber,
            newest: message,
        }
    }

    mapConversation(conversation: Conversation): ConversationView {
        const newest = conversation.recents[0];
        return {
            roomName: conversation.roomName,
            roomAvatar: conversation.roomAvatar,
            chatId: conversation.identifier,
            presence: this.presenceOf(conversation.identifier),
            revisionNumber: conversation.revisionNumber,
            newest: newest,
        }
    }

    compareAndTruncate(conversations: Conversation[], revision?: Revision): Conversation[] {
        if (conversations.length != 0 && revision && revision.revisionNumber === conversations[0].revisionNumber) {
            return conversations.slice(1)
        }
        return conversations;
    }

    protected conversationRows = computed(() => {
        const list = this.displayedConversations.values.map((conversation) =>
            ({type: 'conversation', conversation: conversation} as ConversationRow));
        if (this.expanding() && !this.end()) list.push({type: 'loading'});
        return list;
    })


    defineExpandPipe() {
        effect(() => {
            const index = this.scrollIndex();
            const length = this.history.length();
            console.log(this.expanding())
            if (!this.expanding() && !this.end() && index + 10 >= length) {
                untracked(() => {
                    this.expanding.set(true)
                })
            }
        });
    }

    definePrependingPipe() {
        effect((onCleanup) => {
            const sub = this.logStream.getChannel().subscribe({
                next: log => {
                    const conversation = this.mapLog(log);
                    if (log.action === LogAction.ADDITION) {
                        this.prepend(conversation);
                    } else {
                        this.update(conversation);
                    }
                }
            })
            onCleanup(() => sub.unsubscribe())
        });
    }


    fetchPresences(conversations: Conversation[]): Observable<PresenceMap> {
        const chatIds = conversations.map(conversation => conversation.identifier);
        if (chatIds.length === 0)
            return of({})
        return this.presenceRepo.find(chatIds)
            .pipe(catchError((error) => {
                console.error("Error fetching presences", error);
                return of({});
            }));
    }

    defineAppendingPipe() {
        effect((onCleanup) => {
            if (this.expanding()) {
                const sub = this.expand(this.history.last())
                    .pipe(
                        switchMap(conversations =>
                            this.fetchPresences(conversations).pipe(
                                map(presences => ({conversations, presences}))
                            )
                        )
                    ).subscribe({
                        next: ({conversations, presences}) => {

                            Object.assign(this.presences, presences)

                            conversations.forEach((conversation) => {
                                this.cacheStore.putAll(conversation.recents);
                            })
                            this.append(conversations);
                            if (conversations.length == 0) this.end.set(true);
                            this.expanding.set(false);
                        },
                        error: err => {
                            console.error(err)
                            this.expanding.set(false)
                        }
                    })
                onCleanup(() => sub.unsubscribe())
            }
        });
    }

    expand(revision?: Revision): Observable<Conversation[]> {

        return this.repository
            .list(revision?.revisionNumber)
            .pipe(
                map(conversations =>
                    this.compareAndTruncate(conversations, revision)),
                catchError((error) => {
                    console.error("Error fetching conversations", error);
                    return of([]);
                })
            )
    }


    protected trackBy(index: number, item: ConversationRow) {
        if (item.type === 'loading') {
            return 'loading';
        } else {
            return item.conversation.chatId;
        }
    }

    private append(conversations: Conversation[]) {

        conversations.map(conversation =>
            this.mapConversation(conversation))
            .forEach(conversation => {
                this.displayedConversations.append(conversation, Existing.KEEP);
            });


        conversations.map((conversation) => {
            return {
                chatId: conversation.identifier,
                revisionNumber: conversation.revisionNumber,
                newest: conversation.recents[0]
            }
        }).forEach((conversation) => {
            this.history.append(conversation, Existing.DELETE);
        });
    }


    private prepend(conversation: ConversationView) {
        this.displayedConversations.prepend(conversation, Existing.DELETE);
        this.history.prepend(conversation, Existing.DELETE);
    }


    private update(conversation: ConversationView) {
        this.displayedConversations.replace(conversation);
        this.history.replace(conversation);

    }

}


type ConversationRow =
    | { type: 'loading' }
    | { type: 'conversation'; conversation: ConversationView }

type ConversationView = {
    readonly chatId: string;
    presence: Date,
    roomName: string;
    roomAvatar: string;
    revisionNumber: number;
    newest: MessageState;
}

type Revision = {
    chatId: string;
    newest: MessageState
    revisionNumber: number;
}

class RevisionList<R extends Revision> {
    private readonly _list = signal<R[]>([]);
    readonly length = computed(() => this._list().length)

    compare(value: R, other: R) {
        return value.chatId === other.chatId;
    }

    append(value: R, existing: Existing = Existing.KEEP) {
        this._list.update(list => {
            const index = list.findIndex(r => this.compare(r, value));
            if (index >= 0) {
                if (existing === Existing.REPLACE) {
                    const newList = [...list];
                    newList[index] = value;
                    return newList;
                } else if (existing === Existing.DELETE) {
                    return list.filter((_, i) => i !== index).concat(value);
                }
                return list;
            }
            return [...list, value];
        });
    }

    replace(value: R) {
        this._list.update(list => {
            const index = list.findIndex(r => this.compare(r, value));
            if (index >= 0) {
                const newList = [...list];
                const item = {...newList[index]};
                item.revisionNumber = value.revisionNumber
                if (value.newest.sequenceNumber >= item.newest.sequenceNumber) {
                    item.newest = value.newest;
                }
                newList[index] = item;
                return newList;
            }
            return list;
        });
    }

    prepend(value: R, existing: Existing = Existing.KEEP) {
        this._list.update(list => {
            const index = list.findIndex(r => this.compare(r, value));
            let workingList = list;
            if (index >= 0) {
                if (existing === Existing.REPLACE || existing === Existing.DELETE) {
                    workingList = list.filter((_, i) => i !== index);
                } else {
                    return list;
                }
            }
            return [value, ...workingList];
        });
    }

    get values(): R[] {
        return this._list();
    }

    last(): R | undefined {
        return this._list().at(-1);
    }
}

enum Existing {
    REPLACE,
    DELETE,
    KEEP
}

type Conversations = RevisionList<ConversationView>;
type History = RevisionList<Revision>;