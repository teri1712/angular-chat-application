import {Component, computed, effect, HostBinding, inject, input, signal, untracked, ViewChild} from '@angular/core';
import {ChatInfoBarComponent} from "../chat-info-bar/chat-info-bar.component";
import {InputBarComponent} from "../input-bar/input-bar.component";
import {CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport} from "@angular/cdk/scrolling";
import {ISendingMessage, SendState} from "../../model/message";
import {MessageComponent} from "../message/message.component";
import {CommonModule} from "@angular/common";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {ReactiveFormsModule} from "@angular/forms";
import {DialogService} from "../../service/repository/dialog.service";
import {map, Observable, of, Subject, switchMap, timer} from "rxjs";
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
import {GroupPipe} from "../pipes/group";
import {MymessagesPipe, SendFrame} from "../pipes/sent-message.pipe";
import {GroupMessageComponent} from "../group-message/group-message.component";
import {LeftMessageComponent} from "../left-message/left-message.component";
import {PreferenceMessageComponent} from "../preference-message/preference-message.component";
import {RightMessageComponent} from "../right-message/right-message.component";
import {FileMessageComponent} from "../file-message/file-message.component";
import {IconMessageComponent} from "../icon-message/icon-message.component";
import {ImageMessageComponent} from "../image-message/image-message.component";
import {TextMessageComponent} from "../text-message/text-message.component";
import {rxResource} from "@angular/core/rxjs-interop";
import {MiddleMessageComponent} from "../middle-message/middle-message.component";


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
        MymessagesPipe,
        GroupMessageComponent,
        LeftMessageComponent,
        PreferenceMessageComponent,
        RightMessageComponent,
        FileMessageComponent,
        IconMessageComponent,
        ImageMessageComponent,
        TextMessageComponent,
        MiddleMessageComponent,

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
export class MessageListComponent {

    @ViewChild('viewport') viewport!: CdkVirtualScrollViewport;

    chatId = input.required<string>()
    roomName = input.required<string>();
    roomAvatar = input.required<string>();
    presence = input<Date>();
    preference = input<Preference>();

    private readonly messages = signal<Message[]>([])
    private readonly sendings = rxResource({
        params: () => {
            const chatId = this.chatId()
            if (chatId)
                return ({
                    chatId: this.chatId(),
                })
            return undefined
        },
        stream: (request) => {
            const params = request.params
            const chatId = params.chatId
            return this.messageService.getSendingMessages(chatId)
        },
    });
    private readonly typings = signal<TypeMessage[]>([])


    private readonly expanding = signal<boolean>(false);
    private readonly end = signal<boolean>(false);
    private readonly messageLength = computed(() => this.messages().length)
    private readonly firstVisibleIndex = signal<number>(0);

    private readonly cacheStore = inject(CacheService);
    private readonly dialogService = inject(DialogService);
    private readonly messageRepository = inject(MessageRepository);
    private readonly logStream = inject(LogStream);
    private readonly profileService = inject(ProfileService);
    private readonly messageService = inject(MessageService);
    private readonly sanitizer = inject(DomSanitizer);
    private sendingSize = 0;

    constructor() {
        effect(() => {
            if (this.chatId()) {
                untracked(() => {
                    this.expanding.set(false)
                    this.end.set(false)
                    this.messages.set([])
                    this.firstVisibleIndex.set(0);
                })
            }
        });
        effect(() => {
            const sendings = this.sendings.value()
            const currentSize = this.sendingSize
            this.sendingSize = sendings?.length ?? 0
            if (this.sendingSize > currentSize) {
                this.scrollToBeginning()
            }
        });

        this.defineDisplayPipe();
        this.definePrependingPipe();
        this.defineAppendingPipe();
        this.defineExpandPipe();
    }


    /** Applies the per-chat palette class, e.g. "chat-theme-meadow". */
    @HostBinding('class')
    get hostClass(): string {
        const name = this.preference()?.themeName;
        return name ? `chat-theme-${name}` : '';
    }

    @HostBinding('style')
    get hostStyle(): SafeStyle {
        const theme = this.preference()?.themeBackground;
        if (theme) {
            return this.sanitizer.bypassSecurityTrustStyle(`background-image: url('${theme}')`);
        }
        return this.sanitizer.bypassSecurityTrustStyle(``);
    }

    private scrollToBeginning(): void {
        timer(1000).subscribe(() => {
            if (!this.viewport) return;
            const lastIndex = this.viewport.getDataLength() - 1;
            if (lastIndex >= 0) this.viewport.scrollToIndex(lastIndex);
        })
    }

    private isAtBottom(): boolean {
        if (!this.viewport) return false;
        // If we are within 100px of the bottom, we consider it "focused on bottom"
        return this.viewport.measureScrollOffset('bottom') < 100;
    }

    private checkKeepScrollBeginning(): void {
        if (this.isAtBottom()) {
            this.scrollToBeginning();
        }
    }


    protected onScrollChanged(index: number) {
        this.firstVisibleIndex.set(index);
    }

    private readonly expandTrigger = new Subject<void>();

    protected trackByTrackId(index: number, item: any) {
        switch (item.type) {
            case "typing":
                return item.typeEvent.from;
            case 'loading':
                return '0';
            default:
                return item.message.sequenceNumber
        }
    }


    toMessageRow(message: MessageState): Message {
        const frame: MessageFrame = {
            forceSplit: false,
            receiveTime: new Date(message.createdAt),
            senderId: message.sender.id,
            position: Position.Single,
            displayTime: false
        }

        const mine = this.profileService.thatsMe(message.sender)
        const type = message.messageType.toLowerCase()
        if (type.includes('group')
            || type.includes('preference')) {
            return ({
                type: 'middle-message',
                mine: mine,
                message: message,
                frame: {
                    ...frame,
                    forceSplit: true
                }
            } as Message)
        }
        if (mine) {
            return ({
                type: 'right-message',
                mine: true,
                sendFrame: {
                    sendState: SendState.Received,
                    display: true
                },
                message: message,
                frame: frame
            } as Message)

        }
        return ({
            type: 'left-message',
            message: message,
            mine: false,
            frame: frame
        } as Message)
    }

    toSendingRow(sending: ISendingMessage): MessageRow {
        return {
            type: 'right-message',
            sendFrame: {
                sendState: sending.sendState,
                display: true
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
            mine: false,
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
            mine: false,
            frame: {
                forceSplit: false,
                receiveTime: new Date(),
                senderId: '',
                position: Position.Single,
                displayTime: false
            }
        } as MessageRow
    }


    definePrependingPipe() {
        effect((onCleanup) => {

            const sub = this.logStream.getChannel()
                .subscribe({
                    next: log => {
                        this.cacheStore.put(log.messageState);
                    }
                });
            onCleanup(() => sub.unsubscribe())
        });

        effect((onCleanup) => {
            const chatId = this.chatId()
            if (chatId) {
                const sub = this.logStream.getChatChannel(chatId)
                    .subscribe({
                        next: log => {
                            untracked(() => {
                                const message = log.messageState;
                                if (log.action === LogAction.ADDITION) {
                                    const isMine = this.profileService.thatsMe(message.sender);

                                    this.messages.set(this.prepend(message, this.messages()));

                                    if (isMine) {
                                        this.scrollToBeginning();
                                    }
                                } else {
                                    this.messages.set(this.update(message, this.messages()));
                                }
                            })
                        }
                    })
                onCleanup(() => sub.unsubscribe())
            }
        });

    }


    defineAppendingPipe() {
        effect((onCleanup) => {
            if (this.expanding()) {
                const sub = this.expand()
                    .subscribe({
                        next: newMessages => {
                            untracked(() => {
                                if (newMessages.length == 0) {
                                    this.end.set(true);
                                }

                                this.expanding.set(false);
                                this.checkKeepScrollBeginning()
                                this.messages.set(this.append(this.messages(), newMessages));
                            })
                        },
                        error: err => {
                            console.error(err)
                        }
                    })
                onCleanup(() => sub.unsubscribe())
            }
        });
    }

    defineExpandPipe() {
        effect(() => {
            const index = this.firstVisibleIndex()
            const length = this.messageLength()
            this.checkAndExpand(index);
            untracked(() => {
                this.checkAndExpand(index)
            })
        });
    }

    defineDisplayPipe() {
        effect((onCleanup) => {
            const chatId = this.chatId()
            if (chatId) {
                const sub = this.dialogService.findByChatId(chatId)
                    .pipe(
                        switchMap(dialog => dialog.typings),
                        map(typings => typings.filter(typing => !this.profileService.thatsMe(typing.from)))
                    )
                    .subscribe({
                        next: typings => {
                            this.checkKeepScrollBeginning()
                            this.typings.set(typings);
                        }
                    })
                onCleanup(() => sub.unsubscribe())
            }
        });

    }


    protected messageRows = computed(() => {
        const merged: MessageRow[] = [];
        if (this.expanding() && !this.end()) {
            merged.push(this.toExpandingRow());
        }
        merged.push(
            ...[...this.messages()].reverse(),
            ...(this.sendings.value() ?? []).map(s => this.toSendingRow(s)),
            ...this.typings().map(t => this.toTypingRow(t))
        );
        return merged;
    })

    protected rowLength = computed(() => {
        return this.messageRows().length
    })

    private checkAndExpand(scrollIndex: number) {
        if (!this.expanding() && !this.end() && scrollIndex < 5) {
            this.expanding.set(true);
            this.expandTrigger.next();
        }
    }

    private expand(): Observable<MessageState[]> {
        const chatId = this.chatId()!
        const lastSeq = this.messages().at(-1)?.message?.sequenceNumber;
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
    frame: MessageFrame
    mine: false
}
    | {
    type: 'left-message';
    message: MessageState,
    mine: false,
    frame: MessageFrame
}
    | {
    type: 'middle-message';
    message: MessageState,
    mine: boolean,
    frame: MessageFrame
}
    | {
    type: 'right-message';
    message: MessageState,
    mine: true,
    sendFrame: SendFrame
    frame: MessageFrame
}
    | {
    type: 'typing';
    typeEvent: TypeMessage,
    mine: false,
    frame: MessageFrame
}


type Message = Extract<MessageRow, { type: 'left-message' | 'middle-message' | 'right-message' }>;
