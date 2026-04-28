import {Component, DestroyRef, inject, OnInit, ViewChild} from '@angular/core';
import {CdkVirtualScrollViewport, ScrollingModule} from "@angular/cdk/scrolling";
import {CommonModule} from "@angular/common";
import {ConversationComponent} from "../dialog/conversation.component";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {BehaviorSubject, catchError, combineLatest, map, Observable, of, Subject, switchMap, tap} from "rxjs";
import {ConversationRepository} from "../../service/repository/conversation-repository.service";
import {InboxLog, LogAction} from "../../model/dto/inbox-log";
import {LogStream} from "../../service/repository/log-stream.service";
import {MessageState} from "../../model/dto/message-state";
import CacheStore from "../../service/cache/data/cache-service";
import {Conversation} from "../../model/dto/Conversation";
import {PresenceMap, PresenceRepository} from "../../service/repository/presence-repository.service";
import {ChatPresence} from "../../model/dto/chat-presence";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {debounceTime, distinctUntilChanged} from "rxjs/operators";

@Component({
    selector: 'app-dialog-list',
    imports: [
        ScrollingModule,
        CommonModule,
        ConversationComponent,
        MatProgressSpinner,
    ],
    templateUrl: './conversation-list.component.html',
    styleUrl: './conversation-list.component.css'
})
export class ConversationListComponent implements OnInit {

    @ViewChild('viewport') viewport!: CdkVirtualScrollViewport;

    private readonly scrollIndex = new BehaviorSubject<number>(0);

    protected onScrollChanged(index: number) {
        this.scrollIndex.next(index);
    }

    private readonly conversations: Conversations = new RevisionList();
    private readonly history: History = new RevisionList();

    private expanding: boolean = false;
    private end: boolean = false;

    private readonly expandTrigger = new Subject<void>();


    constructor(
        private readonly repository: ConversationRepository,
        private readonly presenceRepo: PresenceRepository,
        private readonly cacheStore: CacheStore,
        private readonly logStream: LogStream,) {
    }

    mapLog(log: InboxLog, presence?: ChatPresence): ConversationView {
        const message = log.messageState;
        return {
            roomName: log.roomName,
            roomAvatar: log.roomAvatar,
            chatId: log.chatId,
            presence: new Date(),
            revisionNumber: log.revisionNumber,
            newest: message,
        }

    }

    mapConversation(conversation: Conversation, presence?: ChatPresence): ConversationView {
        const newest = conversation.recents[0];
        let presenceAt = new Date(0);
        if (presence?.at)
            presenceAt = new Date(presence.at);
        return {
            roomName: conversation.roomName,
            roomAvatar: conversation.roomAvatar,
            chatId: conversation.identifier,
            presence: presenceAt,
            revisionNumber: conversation.revisionNumber,
            newest: newest,
        }
    }

    compareAndTruncate(conversations: Conversation[], revision?: Revision): Conversation[] {
        if (conversations.length != 0 && revision && revision.revisionNumber !== conversations[0].revisionNumber) {
            return []
        }
        if (revision)
            return conversations.slice(1)
        return conversations;
    }


    protected get conversationRows(): ConversationRow[] {
        const list = this.conversations.getAll().map((conversation) =>
            ({type: 'conversation', conversation: conversation} as ConversationRow));
        if (this.expanding && !this.end) list.push({type: 'loading'});
        return list;
    }

    private checkAndExpand(scrollIndex: number, length: number) {
        if (!this.expanding && !this.end &&
            scrollIndex + 10 >= length) {
            this.expanding = true;
            this.expandTrigger.next();
        }
    }

    defineExpandPipe() {
        combineLatest([this.scrollIndex, this.history.lengthSubject]).pipe(
            takeUntilDestroyed(this.destroyRef),
            debounceTime(500),
            distinctUntilChanged(),
        ).subscribe(([index, length]) => {
            this.checkAndExpand(index, length);
        })
    }

    definePrependingPipe() {
        this.logStream.getChannel()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(log => {
                const conversation = this.mapLog(log);
                if (log.action === LogAction.ADDITION) {
                    this.prepend(this.conversations, conversation);
                    this.prependHistory(this.history, conversation);
                } else {
                    this.update(this.conversations, conversation);
                    this.updateHistory(this.history, conversation);
                }
            })
    }


    fetchPresences(conversations: Conversation[]) {
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
        this.expandTrigger.pipe(
            takeUntilDestroyed(this.destroyRef),
            switchMap(() => this.expand(this.history.last())),
            tap(newConversations => {
                newConversations.forEach((conversation) => {
                    this.cacheStore.putAll(conversation.recents);
                })
            }),
            switchMap(newConversations =>
                this.fetchPresences(newConversations).pipe(
                    map(presences => ({newConversations, presences}))
                )
            ))
            .subscribe(({newConversations, presences}) => {
                if (newConversations.length == 0)
                    this.end = true;
                this.expanding = false;
                this.append(this.conversations, newConversations, presences);
                this.appendHistory(this.history, newConversations);
            })
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


    private readonly destroyRef = inject(DestroyRef);

    ngOnInit(): void {
        this.definePrependingPipe();
        this.defineAppendingPipe();
        this.defineExpandPipe();
    }


    protected trackBy(index: number, item: ConversationRow) {
        if (item.type === 'loading') {
            return '0';
        } else {
            return item.conversation;
        }
    }

    private appendHistory(history: History, conversations: Conversation[]): History {
        conversations.map((conversation) => {
            return {
                chatId: conversation.identifier,
                revisionNumber: conversation.revisionNumber,
                newest: conversation.recents[0]
            }
        }).forEach((conversation) => {
            history.append(conversation, Existing.DELETE);
        });
        return history
    }


    private append(conversations: Conversations, newConversations: Conversation[], presences: PresenceMap): Conversations {

        newConversations.map(conversation =>
            this.mapConversation(conversation, presences[conversation.identifier]))
            .forEach(conversation => {
                conversations.append(conversation, Existing.KEEP);
            });

        return conversations
    }


    private prepend(conversations: Conversations, conversation: ConversationView) {
        conversations.prepend(conversation, Existing.DELETE);
        return conversations
    }

    private prependHistory(history: History, conversation: ConversationView) {
        history.prepend(conversation, Existing.DELETE);
        return history
    }

    private update(conversations: Conversations, conversation: ConversationView) {
        conversations.replace(conversation);
        return conversations
    }

    private updateHistory(history: History, conversation: ConversationView) {
        history.replace(conversation);
        return history
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
    private list: R[] = [];
    private readonly length = new BehaviorSubject<number>(0)


    get lengthSubject() {
        return this.length.asObservable();
    }

    compare(value: R, other: R) {
        return value.chatId === other.chatId;
    }

    append(value: R, existing: Existing = Existing.KEEP) {
        if (this.deduplicate(value, existing))
            this.list.push(value);
        this.length.next(this.list.length);
    }

    private deduplicate(value: R, existing: Existing = Existing.KEEP): boolean {
        const index = this.list.findIndex((revision) => this.compare(revision, value));
        if (index >= 0) {
            if (existing === Existing.REPLACE) {
                this.list[index] = value;
                return false;
            } else if (existing === Existing.DELETE) {
                this.list.splice(index, 1);
                return true;
            }
            return false;
        }
        return true;
    }


    replace(value: R) {
        const index = this.list.findIndex((revision) => this.compare(revision, value));
        if (index >= 0) {
            const item = this.list[index];
            item.revisionNumber = value.revisionNumber
            if (item.newest.sequenceNumber == value.newest.sequenceNumber) {
                item.newest = value.newest;
            }
        }
    }

    prepend(value: R, existing: Existing = Existing.KEEP) {
        if (this.deduplicate(value, existing))
            this.list.unshift(value);
        this.length.next(this.list.length);
    }

    getAll(): R[] {
        return this.list;
    }

    last(): R | undefined {
        return this.list.at(-1);
    }
}

enum Existing {
    REPLACE,
    DELETE,
    KEEP
}

type Conversations = RevisionList<ConversationView>;
type History = RevisionList<Revision>;