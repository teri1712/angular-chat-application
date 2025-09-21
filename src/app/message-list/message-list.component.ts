import {AfterViewChecked, Component, HostBinding, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ChatInfoBarComponent} from "../chat-info-bar/chat-info-bar.component";
import {Dialog} from "../model/dialog";
import {InputBarComponent} from "../input-bar/input-bar.component";
import {CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport} from "@angular/cdk/scrolling";
import {Message, OwnerMessage, SendState} from "../model/message";
import {MessageComponent} from "../message/message.component";
import {User} from "../model/user";
import {RollInFormatter} from "../usecases/format/RollinFormatter";
import {Formatter} from "../usecases/format/Formatter";
import {CommonModule} from "@angular/common";
import {isLoading, isTypeOrMessage} from "../usecases/utils/item-type-check";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {ReactiveFormsModule} from "@angular/forms";
import {ActivatedRoute} from "@angular/router";
import {DialogRepository} from "../usecases/service/repository/dialog-repository";
import {ChannelSubscriber} from "../usecases/service/event/subscribable-channel";
import {ChatEvent} from "../model/chat-event";
import {Observable, Subscription, tap, timer} from "rxjs";
import {Conversation} from "../model/conversation";
import {Chat} from "../model/chat";
import {MessageQuery, MessageRepository} from "../usecases/service/repository/message-repository";
import {ChatIdentifier} from "../model/chat-identifier";
import {TypeEvent} from "../model/type-event";
import {AccountManager} from "../usecases/service/auth/account-manager";
import {MessageService} from "../usecases/service/message-service";
import {SeenEvent} from "../model/seen-event";
import {ChatSubscription} from "../usecases/service/websocket/chat-subscription";
import {StompClient} from "../usecases/service/websocket/stomp-client";
import {ChatSubscriber} from "../usecases/service/websocket/chat-subscriber";
import {DomSanitizer, SafeStyle} from "@angular/platform-browser";
import {SeenEventHandlerStrategy} from "../usecases/service/event-handler.strategy";

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
export class MessageListComponent implements OnInit, OnDestroy, AfterViewChecked {

      @ViewChild('viewport') viewport!: CdkVirtualScrollViewport;

      @HostBinding('style')
      get hostStyle(): SafeStyle {
            const url = this.chat.preference?.theme?.background?.uri;
            if (url) {
                  return this.sanitizer.bypassSecurityTrustStyle(`background-image: url('${url}')`);
            }
            return this.sanitizer.bypassSecurityTrustStyle(``);
      }

      private scrollToBeginning(): void {
            setTimeout(() => {
                  this.viewport.scrollToIndex(this.renderedList.length - 1);
            }, 100)
      }

      protected onScrollChanged(index: number) {
            if (index <= 5) {
                  this.expand()
            }
      }

      private readonly formatter: Formatter = new RollInFormatter()
      private dialog!: Dialog;
      private messages: Message[] = [];
      private partnerSeen?: Message;
      private ownerSeen?: Message;
      private lastSent?: OwnerMessage;

      protected get conversation(): Conversation {
            return this.dialog.conversation;
      }

      protected get onlineAt(): number {
            return this.dialog.onlineAt;
      }

      protected get chat(): Chat {
            return this.conversation.chat;
      }

      protected get partner(): User {
            return this.conversation.partner;
      }

      protected get owner(): User {
            return this.conversation.owner;
      }

      protected get renderedList(): (Message | Boolean | TypeEvent)[] {
            const list: (Message | Boolean | TypeEvent)[] = [
                  new Boolean(!!this.expanding),
                  ...this.messages.slice().reverse(),
            ];
            if (this.partnerType) {
                  list.push(this.partnerType)
            }
            return list
      }


      protected end: boolean = false;
      protected expanding?: Subscription;

      constructor(
              private readonly messageRepository: MessageRepository,
              private readonly dialogRepo: DialogRepository,
              private readonly activatedRoute: ActivatedRoute,
              private readonly accountManager: AccountManager,
              private readonly messageService: MessageService,
              private readonly stompClient: StompClient,
              private readonly sanitizer: DomSanitizer,
      ) {
      }


      private routeSub!: Subscription;
      private eventSub: ChannelSubscriber<ChatEvent> = (event) => {

            if (!this.chat.identifier.equals(event.chatIdentifier))
                  return;
            if (event.isMessage()) {
                  this.prepend(event);
            } else if (event.seenEvent) {
                  const at = event.seenEvent!.at;
                  const ofOwner = event.sender === this.owner.id

                  if (ofOwner) {
                        this.ownerSeen = this.updateSeen(this.owner, at);
                  } else {
                        this.partnerSeen = this.updateSeen(this.partner, at);
                  }
            }

      }

      protected chatSubscription?: ChatSubscription
      private typeTimer!: Subscription
      private partnerType?: TypeEvent
      private chatSub: ChatSubscriber = (event) => {
            if (this.partner.id === event.from) {
                  this.partnerType = event
                  const range = this.viewport.getRenderedRange();
                  const lastVisible = range.end;
                  if (lastVisible >= this.renderedList.length - 1) {
                        this.scrollToBeginning()
                  }
            }
      }


      ngOnInit(): void {
            this.routeSub = this.activatedRoute.paramMap
                    .subscribe(params => {
                          const id = params.get('id')!;
                          const dialog = this.dialogRepo.get(ChatIdentifier.fromString(id))
                          this.refresh(dialog);
                    });
            this.accountManager.eventChannel.subscribe(this.eventSub)
            this.typeTimer = timer(0, 1000).subscribe(() => {
                  if (this.partnerType && this.partnerType.time + 2000 < Date.now()) {
                        this.partnerType = undefined;
                  }
            })
      }

      ngAfterViewChecked(): void {
            const length = this.messages.length;
            if (length === 0)
                  return
            const message = this.messages[0]
            const fromPartner = !this.conversation.isOfOwner(message)

            if (fromPartner && message !== this.ownerSeen) {
                  this.messageService.send(this.conversation, new SeenEventHandlerStrategy(new SeenEvent(Date.now())))
            }
      }

      ngOnDestroy(): void {
            this.accountManager.eventChannel.unsubscribe(this.eventSub)
            this.routeSub.unsubscribe()
            this.typeTimer.unsubscribe()
      }

      private resetView(): void {
            this.end = false;
            this.expanding?.unsubscribe();
            this.expanding = undefined;
            this.chatSubscription?.dispose()
            this.chatSubscription = undefined
            this.partnerType = undefined
      }

      private refresh(dialog: Dialog) {
            this.resetView()

            this.dialog = dialog;
            this.messages = this.dialog.messages
            this.partnerSeen = this.messages.find(message =>
                    this.conversation.isOfOwner(message) && message.seen);
            this.ownerSeen = this.messages.find(message =>
                    !this.conversation.isOfOwner(message) && message.seen);
            this.lastSent = this.messages.find(message =>
                    this.conversation.isOfOwner(message) && message.sendState === SendState.Sent) as OwnerMessage;
            if (this.partnerSeen) {
                  this.partnerSeen.isLastSeen = true;
            }
            if (this.ownerSeen) {
                  this.ownerSeen.isLastSeen = true;
            }
            if (this.lastSent) {
                  this.lastSent.isLastSeen = true;
            }
            this.formatter.format(this.messages);
            this.scrollToBeginning()
            this.expendIfNecessary()
            this.chatSubscription = this.stompClient.subscribe(this.chat.identifier, this.chatSub)
      }


      private expendIfNecessary() {
            if (this.messages.length < 20)
                  this.expand()
      }

      protected expand() {
            if (!this.expanding && !this.end) {
                  const query: MessageQuery = {
                        conversation: this.conversation,
                        startAt: this.messages.length == 0 ? undefined
                                : this.messages[this.messages.length - 1]
                  }
                  const array = this.messageRepository.list(query)
                  if (array instanceof Observable) {
                        this.expanding = array.pipe(tap(() => {
                              this.expanding = undefined;
                        })).subscribe(array => {
                                      const oldRoute = query.conversation.identifier.equals(this.conversation.identifier)
                                      if (oldRoute)
                                            this.append(array)
                                },
                                error => {
                                      console.error(error);
                                },
                        )
                  } else {
                        this.append(array)
                  }
            }
      }

      private append(list: Message[]): void {
            if (list.length == 0) {
                  this.end = true;
                  return
            }
            list.forEach(message => {
                  const ofOwner = this.conversation.isOfOwner(message)

                  const seenEvent = ofOwner
                          ? this.ownerSeen : this.partnerSeen
                  message.seenAt = seenEvent?.seenAt ?? Number.MIN_SAFE_INTEGER;

                  if (ofOwner) {
                        if (this.lastSent) {
                              message.isLastSent = false
                        } else {
                              if (message.sendState === SendState.Sent) {
                                    message.isLastSent = true
                                    this.lastSent = message;
                              }
                        }
                  }
            });
            this.messages.push(...list)
            this.formatter.reformat(this.messages)
      }

      private prepend(event: ChatEvent): void {
            if (event.committed) {
                  for (const existing of this.messages) {
                        if (!this.conversation.isOfOwner(existing)
                                || existing.sendState === SendState.Sent) {
                              break
                        }
                        if (existing.id === event.id) {
                              existing.sendState = SendState.Sent
                              if (this.lastSent) {
                                    this.lastSent.isLastSent = false;
                              }
                              this.lastSent = existing;
                              this.lastSent.isLastSent = true;
                              return;
                        }
                  }
            } else {
                  this.scrollToBeginning()
            }

            const message = this.conversation.toMessage(event);
            this.messages.unshift(message)
            this.formatter.reformat(this.messages)

            if (!this.conversation.isOfOwner(message))
                  this.partnerType = undefined
      }

      private updateSeen(who: User, at: number): Message | undefined {
            let lastSeen: Message | undefined;
            for (const message of this.messages) {
                  if (message.sender !== who.id) {
                        if (!lastSeen)
                              lastSeen = message;
                        message.seenAt = at;

                        if (message.seen) {
                              message.isLastSeen = false;
                              break;
                        }
                  }
            }
            if (lastSeen)
                  lastSeen.isLastSeen = true;
            return lastSeen;
      }


      protected readonly isLoading = isLoading;
      protected readonly isTypeOrMessage = isTypeOrMessage;
}
