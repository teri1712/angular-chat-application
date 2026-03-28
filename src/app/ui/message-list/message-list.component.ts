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
import {
      BehaviorSubject,
      combineLatest,
      filter,
      map,
      Observable,
      of,
      Subject,
      switchMap,
      tap,
      timer,
      withLatestFrom
} from "rxjs";
import {TypeMessage} from "../../model/dto/type-message";
import {MessageService} from "../../service/message-service";
import {DomSanitizer, SafeStyle} from "@angular/platform-browser";
import {MessageFrame, Position} from "../format/Formatter";
import {MessageState} from "../../model/dto/message-state";
import {TypingMessageComponent} from "../typing-left-message/typing-message.component";
import ProfileService from "../../service/profile-service";
import {LogAction} from "../../model/dto/inbox-log";
import {MessageRepository} from "../../service/repository/message-repository.service";
import {LogStream} from "../../service/repository/log-stream.service";
import CacheService from "../../service/cache/data/cache-service";
import {Preference} from "../../model/dto/preference";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {AutoSizeVirtualScrollStrategy} from "@angular/cdk-experimental/scrolling";
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
                  this.expanding = false;
                  this.end = false;
                  this.chatId.next(chatId);
                  this.replace([])
                  this.firstVisibleIndex.next(0);
            }
      }

      @Input() roomName: string | null = null;
      @Input() roomAvatar: string | null = null;
      @Input() presence: Date | null = null;
      @Input() preference: Preference | null = null;

      protected chatId = new BehaviorSubject<string>('');

      /** Applies the per-chat palette class, e.g. "chat-theme-meadow". */
      @HostBinding('class')
      get hostClass(): string {
            const name = this.preference?.themeName;
            return name ? `chat-theme-${name}` : '';
      }

      @HostBinding('style')
      get hostStyle(): SafeStyle {
            const theme = this.preference?.themeBackground;
            if (theme) {
                  return this.sanitizer.bypassSecurityTrustStyle(`background-image: url('${theme}')`);
            }
            return this.sanitizer.bypassSecurityTrustStyle(``);
      }

      private scrollToBeginning(): void {
            timer(100).subscribe(() => {
                  const lastIndex = this.viewport.getDataLength() - 1;
                  if (lastIndex >= 0) this.viewport.scrollToIndex(lastIndex);
            })
      }

      private checkKeepScrollBeginning(): void {
            const range = this.viewport.getRenderedRange();
            const total = this.viewport.getDataLength();

            const isLastItemVisible = range.end >= total;
            if (isLastItemVisible)
                  this.scrollToBeginning();
      }

      private readonly firstVisibleIndex = new BehaviorSubject<number>(0);
      private readonly messageLength = new BehaviorSubject<number>(0)

      protected onScrollChanged(index: number) {
            this.firstVisibleIndex.next(index);
      }

      private messages: Message[] = [];
      private sendings: ISendingMessage[] = [];
      private typings: TypeMessage[] = [];

      private expanding: boolean = false;
      private end: boolean = false;
      private readonly expandTrigger = new Subject<void>();

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
              private readonly logStream: LogStream,
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

      replace(messages: Message[]) {
            this.messages = messages;
            this.messageLength.next(messages.length)
      }


      definePrependingPipe() {
            this.logStream.getChannel().pipe(
                    takeUntilDestroyed(this.destroyRef)
            ).subscribe(log => {
                  this.cacheStore.put(log.messageState);
            });

            this.chatId.pipe(
                    takeUntilDestroyed(this.destroyRef),
                    switchMap(chatId => this.logStream.getChatChannel(chatId)),
            ).subscribe(log => {
                  const message = log.messageState;
                  if (log.action === LogAction.ADDITION) {
                        this.replace(this.prepend(message, this.messages));
                        this.checkKeepScrollBeginning()
                  } else {
                        this.replace(this.update(message, this.messages));
                  }
            });
      }


      defineAppendingPipe() {
            this.expandTrigger.pipe(
                    takeUntilDestroyed(this.destroyRef),
                    withLatestFrom(this.chatId),
                    filter(([trigger, chatId]) => !!chatId),
                    switchMap(([trigger, chatId]) => this.expand(this.messages, chatId)),
            ).subscribe(newMessages => {
                  if (newMessages.length == 0) {
                        this.end = true;
                  }
                  this.expanding = false;
                  this.replace(this.append(this.messages, newMessages));

            });
      }

      defineExpandPipe() {
            combineLatest([this.firstVisibleIndex, this.messageLength]).pipe(
                    takeUntilDestroyed(this.destroyRef),
            ).subscribe(([index, length]) => {
                  this.checkAndExpand(index);
            });
      }

      protected get rowLength(): number {
            let length = 0;
            if (this.expanding && !this.end) {
                  length += 1;
            }
            length += this.messages.length;
            length += this.typings.length;
            return length;
      }

      protected get messageRows(): MessageRow[] {
            const merged: MessageRow[] = [];
            if (this.expanding && !this.end) {
                  merged.push(this.toExpandingRow());
            }
            merged.push(
                    ...[...this.messages].reverse(),
                    ...this.sendings.map(s => this.toSendingRow(s)),
                    ...this.typings.map(t => this.toTypingRow(t))
            );
            return merged;
      }

      private checkAndExpand(scrollIndex: number) {

            if (!this.expanding && !this.end && scrollIndex < 5) {
                  this.expanding = true;
                  this.expandTrigger.next();
            }
      }

      defineDisplayPipe() {
            this.chatId.pipe(
                    takeUntilDestroyed(this.destroyRef),
                    switchMap(chatId => this.messageService.getSendingQueue(chatId)),
                    tap(() => this.scrollToBeginning())
            ).subscribe(sendings => {
                  this.sendings = sendings;
            });

            this.chatId.pipe(
                    takeUntilDestroyed(this.destroyRef),
                    switchMap(chatId => this.dialogService.findByChatId(chatId)),
                    switchMap(dialog => dialog.typings),
                    map(typings => typings.filter(typing => !this.profileService.thatsMe(typing.from)))
            ).subscribe(typings => {
                  this.typings = typings;
                  this.checkKeepScrollBeginning()
            });
      }

      ngOnInit(): void {
            this.defineDisplayPipe();
            this.definePrependingPipe();
            this.defineAppendingPipe();
            this.defineExpandPipe();
      }


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
