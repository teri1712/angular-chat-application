import {Component, OnDestroy, OnInit} from '@angular/core';
import {StompClient} from "../core/service/websocket/stomp-client";
import {AccountManager} from "../core/service/auth/account-manager";
import {MatSnackBar} from "@angular/material/snack-bar";
import {getAuthenticationChannel, UN_AUTHORIZED} from "../core/service/event/commons";
import {Router} from "@angular/router";
import {ChatRepository} from "../core/service/repository/chat-repository";
import {EventCache} from "../core/service/cache/domain/event-cache";
import {DialogRepository} from "../core/service/repository/dialog-repository";
import {EventRepository} from "../core/service/repository/event-repository";
import {UserRepository} from "../core/service/repository/user-repository";
import {OnlineRepository} from "../core/service/repository/online-repository";
import {MessageRepository} from "../core/service/repository/message-repository";
import {MessageService} from "../core/service/message-service";

@Component({
      selector: 'app-home',
      standalone: false,

      templateUrl: './home.component.html',
      styleUrl: './home.component.css',
      providers: [
            AccountManager,
            ChatRepository,
            EventCache,
            DialogRepository,
            EventRepository,
            UserRepository,
            OnlineRepository,
            MessageRepository,
            StompClient,
            MessageService
      ]
})
export class HomeComponent implements OnInit, OnDestroy {

      private authenticationChannel = getAuthenticationChannel();
      private onUnAuthorized =
              (event: MessageEvent<any>) => {
                    if (event.data.type === UN_AUTHORIZED) {
                          const ref = this.snackBar.open("Account Session has expired!", "Logout");
                          ref.onAction().subscribe(() => {
                                this.router.navigate(["/auth/login"], {replaceUrl: true});
                          });
                    }
              }

      constructor(
              accountManager: AccountManager,
              stompClient: StompClient,
              private readonly router: Router,
              private readonly snackBar: MatSnackBar) {
      }

      ngOnDestroy(): void {
            this.authenticationChannel.removeEventListener('message', this.onUnAuthorized);
      }

      ngOnInit(): void {
            this.authenticationChannel.addEventListener('message', this.onUnAuthorized)
      }

}
