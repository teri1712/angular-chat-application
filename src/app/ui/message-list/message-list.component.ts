import {Component, HostBinding, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ChatInfoBarComponent} from "../chat-info-bar/chat-info-bar.component";
import {IDialog} from "../../model/IDialog";
import {InputBarComponent} from "../input-bar/input-bar.component";
import {CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport} from "@angular/cdk/scrolling";
import {IMessage} from "../../model/IMessage";
import {MessageComponent} from "../message/message.component";
import {CommonModule} from "@angular/common";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {ReactiveFormsModule} from "@angular/forms";
import {ActivatedRoute} from "@angular/router";
import {DialogRepository} from "../../service/repository/dialog-repository";
import {finalize, map, Subscription, tap, timer} from "rxjs";
import {fromString} from "../../model/dto/chat-identifier";
import {TypeEvent} from "../../model/dto/type-event";
import {MessageService} from "../../service/message-service";
import {RealtimeClient} from "../../service/websocket/realtime-client.service";
import {ChatSubscriber} from "../../service/websocket/chat-subscriber";
import {DomSanitizer, SafeStyle} from "@angular/platform-browser";
import {User} from "../../model/dto/user";
import {Formatter} from "../format/Formatter";
import {ChatEvent, isPendingEvent} from "../../model/dto/chat-event";
import {EventRepository} from "../../service/repository/event-repository";
import {SeenEventHandlerStrategy} from "../../service/SeenEventHandlerStrategy";
import {TypingMessageComponent} from "../typing-left-message/typing-message.component";
import {Message, MyMessage, toMessage, toMessages, YourMessage} from "./message";
import {RollInFormatter} from "./roll-in-formater";
import Expander from "../expander/expander";
import EventExpander from "./event-expander";
import ProfileService from "../../service/profile-service";

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
            CdkFixedSizeVirtualScroll,
            TypingMessageComponent,
            // CdkAutoSizeVirtualScroll
      ],
      providers: [
            // {
            //       provide: VIRTUAL_SCROLL_STRATEGY,
            //       useFactory: autoSizeStrategyFactory
            // }
      ],
      templateUrl: './message-list.component.html',
      styleUrl: './message-list.component.css'
})
export class MessageListComponent implements OnInit, OnDestroy {

      @ViewChild('viewport') viewport!: CdkVirtualScrollViewport;

      @HostBinding('style')
      get hostStyle(): SafeStyle {
            const url = this.dialog.preference?.theme?.background?.uri;
            if (url) {
                  return this.sanitizer.bypassSecurityTrustStyle(`background-image: url('${url}')`);
            }
            return this.sanitizer.bypassSecurityTrustStyle(``);
      }

      private scrollToBeginning(): void {
            setTimeout(() => {
                  this.viewport.scrollToIndex(this.renderedLength - 1);
            }, 100)
      }

      protected onScrollChanged(index: number) {
            this.expandIfNecessary();
      }

      protected dialog!: IDialog;
      protected me: User

      // Fuck
      protected get renderedList(): MessageRow[] {
            const list: MessageRow[] = [
                  ...this.pending.map((message) => ({
                        type: 'message',
                        message: message
                  } as MessageRow)),
                  ...this.reals.map((message) => ({
                        type: 'message',
                        message: message
                  } as MessageRow))
            ].reverse();
            if (this.typeEvent) {
                  list.push({

                        type: 'typing',
                        typeEvent: this.typeEvent
                  })
            }
            if (this.expanding)
                  list.unshift({type: 'loading'})
            return list
      }

      private get renderedLength(): number {
            let length = this.length()
            if (this.typeEvent) length += 1
            if (this.expanding) length += 1
            return length;
      }

      protected trackByTrackId(index: number, item: MessageRow) {
            switch (item.type) {
                  case "message":
                        return item.message.idempotencyKey;
                  case "typing":
                        return '1';
                  case 'loading':
                        return '0';
                  default:
                        return '2'
            }
      }

      protected expanding?: Subscription;
      private expander!: Expander<ChatEvent>

      private routeSub!: Subscription;
      private activityTimer!: Subscription

      private typeEvent?: TypeEvent
      private chatSubscription?: Subscription;
      private chatSub: ChatSubscriber = (typeEvent) => {
            const mine = typeEvent.from === this.me.id;
            if (!mine) {
                  this.typeEvent = typeEvent
                  const range = this.viewport.getRenderedRange();
                  const lastVisible = range.end;
                  if (lastVisible >= this.renderedList.length - 1) {
                        this.scrollToBeginning()
                  }
            }
      }


      constructor(
              private readonly dialogRepo: DialogRepository,
              private readonly activatedRoute: ActivatedRoute,
              private readonly profileService: ProfileService,
              private readonly eventRepository: EventRepository,
              private readonly messageService: MessageService,
              private readonly realtimeClient: RealtimeClient,
              private readonly sanitizer: DomSanitizer,
      ) {
            this.me = this.profileService.getProfile();
      }


      ngOnInit(): void {
            this.routeSub = this.activatedRoute.paramMap
                    .subscribe(params => {
                          const id = params.get('id')!;
                          const dialog = this.dialogRepo.findByIdentifier(fromString(id))
                          this.dialogRepo.findAndSync(dialog.conversation)
                          this.refresh(dialog);
                    });
            this.activityTimer = timer(0, 1000).subscribe(() => {
                  this.seenCheck()
                  this.typeCheck()
            })
            this.eventSub = this.realtimeClient.getEventChannel().subscribe(this.eventObserver)
      }

      private typeCheck(): void {
            if (this.typeEvent) {
                  const at = new Date(this.typeEvent.time)
                  if (at.getTime() + 2000 < Date.now())
                        this.typeEvent = undefined;
            }
      }

      private seenKey?: string;

      private seenCheck(): void {
            const length = this.yourMessages.length;
            if (length === 0 || this.seenKey)
                  return
            const first = this.yourMessages[0]

            if (!first.seenAt) {
                  const seenStrategy = new SeenEventHandlerStrategy(this.dialog.conversation, new Date())
                  this.seenKey = seenStrategy.idempotencyKey
                  this.messageService.send(this.dialog.conversation, seenStrategy)
            }
      }

      ngOnDestroy(): void {
            this.routeSub.unsubscribe()
            this.activityTimer.unsubscribe()
            this.eventSub.unsubscribe()
      }


      private refresh(dialog: IDialog) {
            this.expanding?.unsubscribe();
            this.chatSubscription?.unsubscribe();
            this.expanding = undefined;
            this.typeEvent = undefined
            this.chatSubscription = undefined;
            this.pending = [];
            this.reals = [];
            this.myMessages = [];
            this.yourMessages = [];
            this.ownerSeenAt = undefined;
            this.partnerSeenAt = undefined;
            this.seenKey = undefined;

            this.dialog = dialog;
            this.expander = new EventExpander(dialog, this.eventRepository);
            this.chatSubscription = this.realtimeClient.subscribeChat(this.dialog.conversation.chat.identifier, this.chatSub)
            this.expandIfNecessary();
      }


      private expandIfNecessary(): void {
            const index = this.viewport?.getRenderedRange().start ?? 0;
            if (this.reals.length >= 40 && index > 5)
                  return;

            if (this.expanding || this.expander.isEnd())
                  return;
            this.expanding = this.expander.expand().pipe(
                    tap(events => this.updateSeenStates(events)),
                    map(events => toMessages(events)),
                    finalize(() => {
                          setTimeout(() => {
                                this.expanding = undefined;
                                this.expandIfNecessary();
                          }, 200)
                    })).subscribe(messages => {
                          messages.forEach(message => this.append(message));
                    },
                    error => {
                          console.error(error);
                    },
            )

      }


      private readonly formatter: Formatter = new RollInFormatter()
      private pending: IMessage[] = [];
      private reals: IMessage[] = [];
      private myMessages: MyMessage[] = []
      private yourMessages: YourMessage[] = []

      private ownerSeenAt?: Date;
      private partnerSeenAt?: Date;

      private eventSub!: Subscription;
      private eventObserver = (event: ChatEvent) => {
            const partner = event.partner.id
            const owner = event.owner.id
            if (owner !== this.me.id || partner !== this.dialog.conversation.partner.id)
                  return;
            if (isPendingEvent(event)) {
                  if (event.message) {
                        this.pending.push(toMessage(event));
                        this.scrollToBeginning()
                  }
                  return;
            }
            const mine = this.isMine(event);
            if (event.eventType === 'SEEN') {
                  const seenAt = new Date(event.seenEvent!.at);
                  if (mine) {
                        if (this.seenKey) {
                              if (event.idempotencyKey === this.seenKey) {
                                    this.seenKey = undefined;
                              }
                        }
                        this.ownerSeenAt = seenAt;
                        for (let i = 0; i < this.yourMessages.length; i++) {
                              if (!!this.yourMessages[i].seenAt)
                                    break
                              this.updateMessageState(i, false)
                        }
                  } else {
                        this.partnerSeenAt = seenAt;
                        for (let i = 0; i < this.myMessages.length; i++) {
                              if (!!this.myMessages[i].seenAt)
                                    break
                              this.updateMessageState(i, true)
                        }
                  }
                  return;
            }
            if (event.message) {
                  const message = toMessage(event);
                  this.prepend(message);
            }
      }

      private length(): number {
            return this.pending.length + this.reals.length;
      }


      private updateSeenStates(events: ChatEvent[]) {
            events.forEach(event => {
                  const mine = this.isMine(event);
                  if (event.eventType === 'SEEN') {
                        const seenAt = new Date(event.seenEvent!.at);
                        if (mine) {
                              if (!this.ownerSeenAt || seenAt > this.ownerSeenAt)
                                    this.ownerSeenAt = seenAt;
                        } else {
                              if (!this.partnerSeenAt || seenAt > this.partnerSeenAt)
                                    this.partnerSeenAt = seenAt;
                        }
                  }
            })
      }


      private updateMessageState(index: number, mine: boolean) {
            if (mine) {
                  const message = this.myMessages[index];
                  if (this.partnerSeenAt && message.receiveTime <= this.partnerSeenAt)
                        message.seenAt = this.partnerSeenAt;
                  if (index == 0) {
                        message.isLastSent = true;
                        if (this.partnerSeenAt && message.receiveTime <= this.partnerSeenAt)
                              message.isLastSeen = true;
                  } else {
                        message.isLastSent = false;
                        const ahead = this.myMessages[index - 1];
                        message.isLastSeen = !!(this.partnerSeenAt
                                && ahead.receiveTime < this.partnerSeenAt
                                && message.receiveTime >= this.partnerSeenAt);
                  }
            } else {
                  const message = this.yourMessages[index];
                  if (this.ownerSeenAt && message.receiveTime <= this.ownerSeenAt)
                        message.seenAt = this.ownerSeenAt;
                  if (index == 0) {
                        if (this.ownerSeenAt && message.receiveTime <= this.ownerSeenAt)
                              message.isLastSeen = true;
                  } else {
                        const ahead = this.yourMessages[index - 1];
                        message.isLastSeen = !!(this.ownerSeenAt
                                && ahead.receiveTime < this.ownerSeenAt
                                && message.receiveTime >= this.ownerSeenAt);
                  }
            }
      }

      private append(message: IMessage) {
            this.reals.push(message);
            const mine = this.isMine(message);
            if (mine) {
                  this.myMessages.push(message as MyMessage);

                  const length = this.myMessages.length;
                  this.updateMessageState(length - 1, true);
                  if (length > 1)
                        this.updateMessageState(length - 2, true);
            } else {
                  this.yourMessages.push(message as YourMessage);

                  const length = this.yourMessages.length;
                  this.updateMessageState(length - 1, false);
                  if (length > 1)
                        this.updateMessageState(length - 2, false);
            }
            this.formatter.reformat(this.reals);
            this.formatter.reformat(this.pending);
      }

      private prepend(message: IMessage) {
            this.reals.unshift(message);
            const mine = this.isMine(message);
            if (mine) {
                  const thePendingIdx = this.pending.findIndex(pending =>
                          pending.idempotencyKey === message.idempotencyKey
                  );
                  if (thePendingIdx >= 0) {
                        this.pending.splice(thePendingIdx, 1);
                  }
                  this.myMessages.unshift(message as MyMessage);
                  this.updateMessageState(0, true);

                  if (this.myMessages.length > 1)
                        this.updateMessageState(1, true);
            } else {
                  this.yourMessages.unshift(message as YourMessage);
                  this.updateMessageState(0, false);

                  if (this.yourMessages.length > 1)
                        this.updateMessageState(1, false);
            }
            this.formatter.reformat(this.reals);
            this.formatter.reformat(this.pending);
      }

      private isMine(message: IMessage | ChatEvent): boolean {
            return message.sender === this.me.id;
      }

}

type MessageRow =
        | {
      type: 'loading'
}
        | {
      type: 'message';
      message: Message
}
        | {
      type: 'typing';
      typeEvent: TypeEvent
}


