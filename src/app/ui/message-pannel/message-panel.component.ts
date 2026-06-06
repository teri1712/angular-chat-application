import {Component, computed, effect, HostListener, inject, signal, untracked, ViewChild} from '@angular/core';
import {CdkVirtualScrollViewport} from "@angular/cdk/scrolling";
import {CommonModule} from "@angular/common";
import {ReactiveFormsModule} from "@angular/forms";
import {ActivatedRoute} from "@angular/router";
import {DialogService} from "../../service/repository/dialog.service";
import {MessageListComponent} from "../message-list/message-list.component";
import {rxResource} from "@angular/core/rxjs-interop";
import {MessageService} from "../../service/message-service";
import {SeenPosting} from "../../service/seen-handler";
import ProfileService from "../../service/profile-service";
import {LogStream} from "../../service/repository/log-stream.service";

@Component({
    selector: 'app-message-panel',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MessageListComponent,

        // CdkAutoSizeVirtualScroll
    ],
    providers: [
        // {
        //       provide: VIRTUAL_SCROLL_STRATEGY,
        //       useFactory: autoSizeStrategyFactory
        // }
    ],
    templateUrl: './message-panel.component.html',
    styleUrl: './message-panel.component.css'
})
export class MessagePanelComponent {

    @ViewChild('viewport') viewport!: CdkVirtualScrollViewport;

    protected routeRoomName = signal('');
    protected routeRoomAvatar = signal('');
    protected routePresence = signal(new Date(0));

    protected chatId = signal('');

    private readonly logStream = inject(LogStream)
    private readonly profileService = inject(ProfileService)
    private readonly dialogService = inject(DialogService)
    private readonly activatedRoute = inject(ActivatedRoute)
    private readonly messageService = inject(MessageService)

    private readonly dialog = rxResource({
        params: () => {
            const chatId = this.chatId();
            if (chatId)
                return ({
                    chatId: chatId,
                })
            return undefined
        },
        stream: (request) => {
            const params = request.params
            const chatId = params.chatId
            return this.dialogService.findByChatId(chatId)
        },
    });

    roomName = computed(() => {
        return this.dialog.value()?.roomName() || this.routeRoomName()
    })
    roomAvatar = computed(() => {
        return this.dialog.value()?.roomAvatar() || this.routeRoomAvatar()
    })

    protected readonly presence = rxResource({
        params: () => {
            const dialog = this.dialog.value();
            if (dialog)
                return ({
                    dialog: dialog,
                })
            return undefined
        },
        stream: (request) => {
            const params = request.params
            const dialog = params.dialog
            return dialog.presence
        },
    });
    protected readonly preference = rxResource({
        params: () => {
            const dialog = this.dialog.value();
            if (dialog)
                return {
                    dialog,
                }
            return undefined
        },
        stream: (request) => {
            const params = request.params
            const dialog = params.dialog
            return dialog.preference
        },
    });

    constructor() {
        effect((onCleanup) => {
            const dialog = this.dialog.value()
            if (dialog) {
                dialog.join();
                onCleanup(() => dialog.leave())
            }
        });

        effect(() => {
            const at = this.seenAt()
            const chatId = untracked(() => this.chatId())
            if (chatId && at) {
                this.onSeen(at, chatId)
            }
        });

        this.activatedRoute.paramMap.subscribe(params => {
            const id = params.get('id')!;
            this.chatId.set(id)
        })
        this.activatedRoute.queryParamMap.subscribe(query => {
            const roomName = query.get('roomName');
            const roomAvatar = query.get('roomAvatar');
            const presence = query.get('presence');
            console.log(roomName)
            if (roomName)
                this.routeRoomName.set(roomName);
            if (roomAvatar)
                this.routeRoomAvatar.set(roomAvatar);
            if (presence)
                this.routePresence.set(new Date(presence));
        })

        effect((onCleanup) => {
            const chatId = this.chatId();
            if (chatId) {
                this.readyToBeSeen = true;
                const sub = this.logStream.getChatChannel(chatId)
                    .subscribe({
                        next: (log) => {
                            if (!this.profileService.thatsMe(log.sender))
                                this.readyToBeSeen = true;
                        },
                        error: err => {
                            console.error(err)
                        }
                    })
                onCleanup(() => sub.unsubscribe())
            }
        });
    }

    private readonly seenAt = signal<Date | undefined>(undefined)
    private readyToBeSeen: boolean = false

    @HostListener('focusin')
    onFocus() {
        if (this.readyToBeSeen) {
            this.seenAt.set(new Date());
            this.readyToBeSeen = false;
        }
    }


    onSeen(at: Date, chatId: string) {
        const seenPosting = new SeenPosting(at, chatId);
        this.messageService.send(seenPosting);
    }
}


