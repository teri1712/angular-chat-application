import {Component, OnDestroy, OnInit} from '@angular/core';
import {StompClient} from "../core/service/websocket/stomp-client";
import {AccountManager} from "../core/service/auth/account-manager";
import {MatSnackBar} from "@angular/material/snack-bar";
import {getAuthenticationChannel, UN_AUTHORIZED} from "../core/service/event/commons";
import {Router} from "@angular/router";

@Component({
      selector: 'app-home',
      standalone: false,

      templateUrl: './home.component.html',
      styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {

      private authenticationChannel = getAuthenticationChannel();
      private onUnAuthorized =
              (event: MessageEvent<any>) => {
                    if (event.data.type === UN_AUTHORIZED) {
                          const ref = this.snackBar.open("Account Session has expired!", "Logout");
                          ref.onAction().subscribe(() => {
                                this.router.navigate(["/auth/login"]);
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
