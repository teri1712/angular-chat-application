import {Component, effect, inject, signal} from '@angular/core';
import {MatSnackBar} from "@angular/material/snack-bar";
import {Router} from "@angular/router";

import {UserRepository} from "../../service/repository/user-repository";
import {SearchRepository} from "../../service/repository/search-repository";
import ProfileService from "../../service/profile-service";
import GroupService from "../../service/group-service";
import {ChatRepository, DirectRepository} from "../../service/repository/chat-repository";
import {LogStream} from "../../service/repository/log-stream.service";
import {ConversationRepository} from "../../service/repository/conversation-repository.service";
import CacheService from "../../service/cache/data/cache-service";
import {DialogService} from "../../service/repository/dialog.service";
import {MessageRepository} from "../../service/repository/message-repository.service";
import {PresenceRepository} from "../../service/repository/presence-repository.service";
import {RealtimeService} from "../../service/websocket/realtime.service";
import {MessageService} from "../../service/message-service";
import {HANDLERS} from "../../service/event-handler";
import {TextHandler} from "../../service/text-handler";
import {IconHandler} from "../../service/icon-handler";
import {SeenHandler} from "../../service/seen-handler";
import {FileHandler} from "../../service/file-handler";
import {ImageHandler} from "../../service/image-handler";
import {LIVE_CHAT_SERVICE} from "../../service/repository/live-chat.service";
import {Authenticator} from "../../service/auth/authenticator";
import {Observable, timer} from "rxjs";

@Component({
    selector: 'app-home',
    standalone: false,

    templateUrl: './home.component.html',
    styleUrl: './home.component.css',
    providers: [
        ProfileService,
        GroupService,
        ChatRepository,
        DirectRepository,
        ConversationRepository,
        CacheService,
        DialogService,
        MessageRepository,
        UserRepository,
        PresenceRepository,
        RealtimeService,
        MessageService,
        SearchRepository,
        {
            provide: LogStream,
            useExisting: RealtimeService
        },
        {
            provide: LIVE_CHAT_SERVICE,
            useExisting: RealtimeService
        },
        {
            provide: HANDLERS,
            useClass: TextHandler,
            multi: true
        },
        {
            provide: HANDLERS,
            useClass: IconHandler,
            multi: true
        },
        {
            provide: HANDLERS,
            useClass: SeenHandler,
            multi: true
        },
        {
            provide: HANDLERS,
            useClass: FileHandler,
            multi: true
        },
        {
            provide: HANDLERS,
            useClass: ImageHandler,
            multi: true
        }
    ]
})
export class HomeComponent {

    protected readonly authenticator = inject(Authenticator)
    private profileService = inject(ProfileService)
    private stompClient = inject(RealtimeService)
    private readonly router = inject(Router)
    private readonly snackBar = inject(MatSnackBar)

    splashing = signal(true)

    constructor() {
        const ref = effect(() => {
            const justLoggedin = this.authenticator.justLoggedIn()
            const splashTimeout: Observable<any> = justLoggedin ? timer(2000) :
                this.profileService.refresh()
            splashTimeout.subscribe({
                next: value => {
                    this.splashing.set(false)
                    ref.destroy()
                }
            })
        });
    }


}
