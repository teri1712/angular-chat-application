import {Component, OnDestroy, OnInit} from '@angular/core';
import {LogTrailerService} from "../../service/websocket/log-trailer.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Router} from "@angular/router";
import {ConversationRepository} from "../../service/repository/conversation-repository.service";
import {DialogService} from "../../service/repository/dialog.service";
import {MessageRepository} from "../../service/repository/message-repository.service";
import {UserRepository} from "../../service/repository/user-repository";
import {PresenceRepository} from "../../service/repository/presence-repository.service";
import {MessageService} from "../../service/message-service";
import {AccountRepository} from "../../service/auth/account-repository";
import CacheService from "../../service/cache/data/cache-service";
import ProfileService from "../../service/profile-service";
import {SearchRepository} from "../../service/repository/search-repository";
import {AccountService} from "../../service/auth/account.service";
import {HANDLERS} from "../../service/event-handler";
import {TextHandler} from "../../service/text-handler";
import {IconHandler} from "../../service/icon-handler";
import {SeenHandler} from "../../service/seen-handler";
import {FileHandler} from "../../service/file-handler";
import {ImageHandler} from "../../service/image-handler";
import {LogRepository} from "../../service/repository/log-repository";
import {ChatRepository, DirectRepository} from "../../service/repository/chat-repository";

@Component({
      selector: 'app-home',
      standalone: false,

      templateUrl: './home.component.html',
      styleUrl: './home.component.css',
      providers: [
            ChatRepository,
            DirectRepository,
            LogRepository,
            ConversationRepository,
            CacheService,
            DialogService,
            MessageRepository,
            UserRepository,
            PresenceRepository,
            LogTrailerService,
            MessageService,
            ProfileService,
            SearchRepository,
            {
                  provide: AccountRepository,
                  useExisting: AccountService
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
export class HomeComponent implements OnInit, OnDestroy {


      constructor(
              private readonly accountRepository: AccountRepository,
              stompClient: LogTrailerService,
              private readonly router: Router,
              private readonly snackBar: MatSnackBar) {
      }

      ngOnDestroy(): void {
      }

      ngOnInit(): void {
      }

}
