import {Component, DestroyRef, inject, OnInit, ViewChild} from '@angular/core';
import {CdkVirtualScrollViewport, ScrollingModule} from "@angular/cdk/scrolling";
import {CommonModule} from "@angular/common";
import {ConversationComponent} from "../dialog/conversation.component";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {BehaviorSubject, catchError, combineLatest, filter, map, Observable, of, switchMap, withLatestFrom} from "rxjs";
import {ConversationRepository} from "../../service/repository/conversation-repository.service";
import {InboxLog, LogAction} from "../../model/dto/inbox-log";
import {LogRepository} from "../../service/repository/log-repository";
import {TextState} from "../../model/dto/text-state";
import {MessageState} from "../../model/dto/message-state";
import ProfileService from "../../service/profile-service";
import {User} from "../../model/dto/user";
import CacheStore from "../../service/cache/data/cache-service";
import {Conversation} from "../../model/dto/Conversation";
import {PresenceMap, PresenceRepository} from "../../service/repository/presence-repository.service";
import {ChatPresence} from "../../model/dto/chat-presence";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {distinctUntilChanged} from "rxjs/operators";

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

      protected conversationRows = new Observable<ConversationRow[]>();
      private readonly conversations = new BehaviorSubject<Conversations>(new RevisionList());
      private readonly history = new BehaviorSubject<History>(new RevisionList());


      protected expanding = new BehaviorSubject<boolean>(false);
      protected end = new BehaviorSubject<boolean>(false);


      constructor(
              private readonly profileService: ProfileService,
              private readonly repository: ConversationRepository,
              private readonly presenceRepo: PresenceRepository,
              private readonly cacheStore: CacheStore,
              private readonly logRepository: LogRepository,) {
      }

      mapLog(log: InboxLog, presence?: ChatPresence): ConversationView {
            const message = log.messageState;
            return {
                  roomName: log.roomName,
                  roomAvatar: log.roomAvatar,
                  chatId: log.chatId,
                  presence: new Date(),
                  revisionNumber: log.revisionNumber,
                  content: this.getPreview(message),
                  sender: message.sender,
                  seenBy: message.seenBy,
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
                  sender: newest.sender,
                  content: this.getPreview(newest),
                  seenBy: newest.seenBy
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


      defineDisplayPipe() {

            const loading = combineLatest([this.expanding, this.end]).pipe(
                    map(([expanding, end]) => expanding && !end));

            this.conversationRows = combineLatest([this.conversations, loading]).pipe(
                    map(([conversations, loading]) => {
                          const list = conversations.getAll().map((conversation) =>
                                  ({type: 'conversation', conversation: conversation} as ConversationRow));
                          if (loading) list.push({type: 'loading'})
                          return list
                    })
            )

      }

      defineExpandPipe() {
            combineLatest([this.scrollIndex, this.conversations])
                    .pipe(
                            takeUntilDestroyed(this.destroyRef),
                            distinctUntilChanged(),
                    )
                    .subscribe(([scrollIndex, conversations]) => {
                          if (scrollIndex + 10 >= conversations.getAll().length) {
                                this.expanding.next(true);
                          }
                    })
      }

      definePrependingPipe() {
            this.logRepository.getChannel()
                    .pipe(takeUntilDestroyed(this.destroyRef),
                            withLatestFrom(this.conversations, this.history),
                    )
                    .subscribe(([log, conversations, history]) => {
                          const conversation = this.mapLog(log);
                          if (log.action === LogAction.ADDITION) {

                                this.conversations.next(this.prepend(conversations, conversation));
                                this.history.next(this.prependHistory(history, conversation));
                          } else {

                                this.conversations.next(this.update(conversations, conversation));
                                this.history.next(this.updateHistory(history, conversation));
                          }

                    })
      }


      fetchPresences(conversations: Conversation[]) {
            const chatIds = conversations.map(conversation => conversation.identifier);
            console.log("Fetching presences for ", chatIds);
            return this.presenceRepo.find(chatIds)
                    .pipe(catchError((error) => {
                          console.error("Error fetching presences", error);
                          return of({});
                    }));
      }

      defineAppendingPipe() {
            combineLatest([this.expanding, this.end]).pipe(
                    takeUntilDestroyed(this.destroyRef),
                    filter(([expanding, end]) => expanding && !end),
                    withLatestFrom(this.history, this.conversations),
                    switchMap(([, history, conversations]) => {
                                  return combineLatest([of(history), of(conversations), this.expand(history.last())]);
                            }
                    ),
                    switchMap(([revisions, conversations, newConversations]) => {
                          return combineLatest(
                                  [of(revisions),
                                        of(conversations),
                                        of(newConversations),
                                        this.fetchPresences(newConversations)]);
                    }))
                    .subscribe(([revisions, conversations, newConversations, presences]) => {
                          newConversations.forEach((conversation) => {
                                this.cacheStore.putAll(conversation.recents);
                          })
                          this.conversations.next(this.append(conversations, newConversations, presences));
                          this.history.next(this.appendHistory(revisions, newConversations));
                          if (newConversations.length == 0) {
                                this.end.next(true);
                          }
                          this.expanding.next(false);
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
            this.defineDisplayPipe();
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
                        revisionNumber: conversation.revisionNumber
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


      getPreview(messageState: MessageState): string {

            const prefix = this.profileService.thatsMe(messageState.sender) ? "You " : "";
            let content = "Wtf";

            switch (messageState.messageType.toLowerCase()) {
                  case "text":
                        content = (messageState as TextState).content;
                        break;

                  case "image":
                        content = "has sent an image";
                        break;

                  case "icon":
                        content = "has sent an icon";
                        break;

                  case "preference":
                        content = "has updated preferences";
                        break;

                  case "file":
                        content = "has sent a file";
                        break;

                  default:
                        break;
            }

            return prefix + content;

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
      sender: User;
      content: string;
      seenBy: User[]
}

type Revision = {
      chatId: string;
      revisionNumber: number;
}

class RevisionList<R extends Revision> {
      private list: R[] = [];

      compare(value: R, other: R) {
            return value.chatId === other.chatId;
      }

      append(value: R, existing: Existing = Existing.KEEP) {
            if (this.deduplicate(value, existing))
                  this.list.push(value);
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
                  this.list[index] = value;
            }
      }

      prepend(value: R, existing: Existing = Existing.KEEP) {
            if (this.deduplicate(value, existing))
                  this.list.unshift(value);
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