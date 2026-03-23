import {Component, DestroyRef, HostBinding, inject, Input, OnInit, ViewChild} from '@angular/core';
import {ChatInfoBarComponent} from "../chat-info-bar/chat-info-bar.component";
import {InputBarComponent} from "../input-bar/input-bar.component";
import {CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport} from "@angular/cdk/scrolling";
import {ISendingMessage, SendState} from "../../model/message";
import {MessageComponent} from "../message/message.component";
import {CommonModule} from "@angular/common";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {ReactiveFormsModule} from "@angular/forms";
import {DialogService} from "../../service/repository/dialog.service";
import {BehaviorSubject, combineLatest, filter, map, Observable, of, switchMap, tap, withLatestFrom} from "rxjs";
import {TypeMessage} from "../../model/dto/type-message";
import {MessageService} from "../../service/message-service";
import {DomSanitizer, SafeStyle} from "@angular/platform-browser";
import {MessageFrame, Position} from "../format/Formatter";
import {MessageState} from "../../model/dto/message-state";
import {TypingMessageComponent} from "../typing-left-message/typing-message.component";
import ProfileService from "../../service/profile-service";
import {LogAction} from "../../model/dto/inbox-log";
import {MessageRepository} from "../../service/repository/message-repository.service";
import {LogRepository} from "../../service/repository/log-repository";
import CacheService from "../../service/cache/data/cache-service";
import {Preference} from "../../model/dto/preference";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {AutoSizeVirtualScrollStrategy} from "@angular/cdk-experimental/scrolling";
import {distinctUntilChanged} from "rxjs/operators";
import {GroupPipe} from "../pipes/group";
import {SendMessage, SentMessagesPipe} from "../pipes/sent-message.pipe";

export function scrollStrategyFactory() {
      return new AutoSizeVirtualScrollStrategy(200, 400);
}

@Component({
      selector: 'app-message-list',
      imports: [
            CommonModule,
            ChatInfoBarComponent,
            InputBarComponent,
            CdkVirtualForOf,
            CdkVirtualScrollViewport,
            MessageComponent,
            MatProgressSpinner,
            ReactiveFormsModule,
            TypingMessageComponent,
            CdkFixedSizeVirtualScroll,
            GroupPipe,
            SentMessagesPipe,

            // CdkAutoSizeVirtualScroll
      ],
      // providers: [
      //       {
      //             provide: VIRTUAL_SCROLL_STRATEGY,
      //             useFactory: scrollStrategyFactory
      //       }
      //
      // ],
      templateUrl: './message-list.component.html',
      styleUrl: './message-list.component.css'
})
export class MessageListComponent implements OnInit {

      @ViewChild('viewport') viewport!: CdkVirtualScrollViewport;

      @Input() set chat(chatId: string | null) {
            if (chatId) {
                  this.messages.next([]);
                  this.expanding.next(false);
                  this.end.next(false);
                  this.chatId.next(chatId)
                  this.scrollIndex.next(0);
            }
      }

      @Input() roomName: string | null = null;
      @Input() roomAvatar: string | null = null;
      @Input() presence: Date | null = null;
      @Input() preference: Preference | null = null;

      protected chatId = new BehaviorSubject<string>('');

      @HostBinding('style')
      get hostStyle(): SafeStyle {
            const theme = this.preference?.theme;
            if (theme) {
                  return this.sanitizer.bypassSecurityTrustStyle(`background-image: url('${theme}')`);
            }
            return this.sanitizer.bypassSecurityTrustStyle(``);
      }

      private scrollToBeginning(): void {
            setTimeout(() => {
                  const lastIndex = this.viewport.getDataLength() - 1;
                  this.viewport.scrollToIndex(lastIndex);
            }, 100)
      }

      private readonly scrollIndex = new BehaviorSubject<number>(0);

      protected onScrollChanged(index: number) {
            this.scrollIndex.next(index);
      }

      // Fuck

      protected messageRows = new Observable<MessageRow[]>();
      private readonly messages = new BehaviorSubject<Message[]>([]);

      protected trackByTrackId(index: number, item: MessageRow) {
            switch (item.type) {
                  case "message":
                        return item.message.sequenceNumber;
                  case "typing":
                        return item.typeEvent.from;
                  case 'loading':
                        return '0';
                  default:
                        return 'wtf'
            }
      }


      constructor(
              private readonly cacheStore: CacheService,
              private readonly dialogService: DialogService,
              private readonly messageRepository: MessageRepository,
              private readonly logRepository: LogRepository,
              private readonly profileService: ProfileService,
              private readonly messageService: MessageService,
              private readonly sanitizer: DomSanitizer
      ) {
      }


      toMessageRow(message: MessageState): Message {
            const frame: MessageFrame = {
                  forceSplit: false,
                  receiveTime: new Date(message.createdAt),
                  senderId: message.sender.id,
                  position: Position.Single,
                  displayTime: false
            }

            return ({
                  type: 'message',
                  sent: {
                        sendState: SendState.Sent,
                  },
                  mine: this.profileService.thatsMe(message.sender),
                  message: message,
                  frame: frame
            } as Message)
      }

      toSendingRow(sending: ISendingMessage): MessageRow {
            return {
                  type: 'message',
                  sent: {
                        sendState: sending.sendState,
                  },
                  mine: true,
                  message: sending.mockState,
                  frame: {
                        forceSplit: false,
                        receiveTime: new Date(sending.mockState.createdAt),
                        senderId: sending.mockState.sender.id,
                        position: Position.Single,
                        displayTime: false
                  }
            } as MessageRow;
      }

      toTypingRow(typing: TypeMessage): MessageRow {
            return {
                  type: 'typing',
                  typeEvent: typing,
                  frame: {
                        forceSplit: true,
                        receiveTime: new Date(typing.time),
                        senderId: typing.from,
                        position: Position.Single,
                        displayTime: false
                  }
            } as MessageRow
      }

      toExpandingRow(): MessageRow {
            return {
                  type: 'loading',
                  frame: {
                        forceSplit: false,
                        receiveTime: new Date(),
                        senderId: '',
                        position: Position.Single,
                        displayTime: false
                  }
            } as MessageRow
      }

      private readonly destroyRef = inject(DestroyRef);


      definePrependingPipe() {
            this.logRepository.getChannel().pipe(
                    takeUntilDestroyed(this.destroyRef)
            ).subscribe((log) => {
                  this.cacheStore.put(log.messageState);
            })
            this.chatId.pipe(
                    takeUntilDestroyed(this.destroyRef),
                    switchMap((chatId) => {
                          return this.logRepository.getChatChannel(chatId);
                    }), withLatestFrom(this.messages),)
                    .subscribe(([log, messages]) => {
                          const message = log.messageState;
                          if (log.action === LogAction.ADDITION)
                                this.messages.next(this.prepend(message, messages));
                          else
                                this.messages.next(this.update(message, messages));

                    })
      }

      defineAppendingPipe() {
            combineLatest([this.expanding, this.end]).pipe(
                    takeUntilDestroyed(this.destroyRef),
                    filter(([expanding, end]) =>
                            expanding && !end
                    ), withLatestFrom(this.chatId, this.messages),
                    switchMap(([, chatId, messages]) =>
                            this.expand(messages, chatId)
                    ), withLatestFrom(this.messages))
                    .subscribe(([newMessages, messages]) => {
                          this.messages.next(this.append(messages, newMessages));
                          if (newMessages.length == 0) {
                                this.end.next(true);
                          }
                          this.expanding.next(false);
                    })
      }

      defineExpandPipe() {
            combineLatest([this.scrollIndex, this.messages])
                    .pipe(
                            takeUntilDestroyed(this.destroyRef),
                            distinctUntilChanged(),
                    )
                    .subscribe(([scrollIndex, messages]) => {
                          if (scrollIndex < 5) {
                                this.expanding.next(true);
                          }
                    })
      }

      defineDisplayPipe() {

            const loading = combineLatest([this.expanding, this.end]).pipe(
                    map(([expanding, end]) => expanding && !end));

            const sendings = this.chatId.pipe(
                    takeUntilDestroyed(this.destroyRef),
                    switchMap((chatId) => {
                          return this.messageService.getSendingQueue(chatId);
                    }),
                    tap(() => {
                          this.scrollToBeginning();
                    }))

            const typings = this.chatId.pipe(
                    switchMap((chatId) => this.dialogService.findByChatId(chatId)),
                    switchMap((dialog) => dialog.typings),
                    map(typings => typings.filter(typing => !this.profileService.thatsMe(typing.from)))
            )
            this.messageRows = combineLatest([this.messages, sendings, typings, loading])
                    .pipe(map(([messages, sendings, typings, loading]) => {
                          const merged: MessageRow[] = []
                          if (loading) {
                                merged.push(this.toExpandingRow());
                          }
                          merged.push(
                                  ...[...messages].reverse(),
                                  ...sendings.map(sending => this.toSendingRow(sending)),
                                  ...typings.map(typing => this.toTypingRow(typing)))
                          return merged
                    }))
      }

      ngOnInit(): void {

            this.defineDisplayPipe();
            this.definePrependingPipe();
            this.defineAppendingPipe();
            this.defineExpandPipe();
      }


      protected expanding = new BehaviorSubject<boolean>(false);
      protected end = new BehaviorSubject<boolean>(false);

      private expand(messages: Message[], chatId: string): Observable<MessageState[]> {

            const lastSeq = messages.at(-1)?.message?.sequenceNumber;
            const anchor = (lastSeq ?? Number.MAX_SAFE_INTEGER) - 1;

            const cached = this.cacheStore.list(chatId, anchor);
            if (cached.length > 0) {
                  return of(cached);
            }

            return this.messageRepository.list({chatId: chatId, anchorSequenceNumber: anchor});

      }


      private append(messages: Message[], newMessages: MessageState[]): Message[] {
            this.cacheStore.putAll(newMessages);

            messages.push(...newMessages.map((state) => this.toMessageRow(state)))

            return messages

      }

      private prepend(message: MessageState, messages: Message[]): Message[] {
            return [this.toMessageRow(message), ...messages];
      }

      private update(message: MessageState, messages: Message[]): Message[] {
            const index = messages.findIndex(msg =>
                    msg.message.sequenceNumber === message.sequenceNumber);
            messages[index] = this.toMessageRow(message);
            return messages;
      }

}

type MessageRow =
        | {
      type: 'loading',
      frame: MessageFrame,
      mine: false,
      sent?: SendMessage,
}
        | {
      type: 'message';
      message: MessageState,
      mine: boolean,
      sent: SendMessage
      frame: MessageFrame
}
        | {
      type: 'typing';
      typeEvent: TypeMessage,
      message: MessageState,
      mine: false,
      frame: MessageFrame,
      sent?: SendMessage,
}


type Message = Extract<MessageRow, { type: 'message' }>;
