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
import {LogTrailerService} from "../../service/websocket/log-trailer.service";
import {MessageService} from "../../service/message-service";
import {HANDLERS} from "../../service/event-handler";
import {TextHandler} from "../../service/text-handler";
import {IconHandler} from "../../service/icon-handler";
import {SeenHandler} from "../../service/seen-handler";
import {FileHandler} from "../../service/file-handler";
import {ImageHandler} from "../../service/image-handler";
import {ITokenStore} from "../../service/auth/token-store.interface";

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
        LogTrailerService,
        MessageService,
        SearchRepository,
        {
            provide: LogStream,
            useExisting: LogTrailerService
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

    private readonly tokenStore = inject(ITokenStore)
    private profileService = inject(ProfileService)
    private stompClient = inject(LogTrailerService)
    private readonly router = inject(Router)
    private readonly snackBar = inject(MatSnackBar)

    splashing = signal(true)

    constructor() {
        effect(() => {
            this.profileService.refresh().subscribe({
                next: value => {
                    this.splashing.set(false)
                }
            })
        });
    }


}
