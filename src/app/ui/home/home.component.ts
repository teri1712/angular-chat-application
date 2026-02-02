import {Component, OnDestroy, OnInit} from '@angular/core';
import {RealtimeClient} from "../../service/websocket/realtime-client.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Router} from "@angular/router";
import {ChatRepository} from "../../service/repository/chat-repository";
import {DialogRepository} from "../../service/repository/dialog-repository";
import {EventRepository} from "../../service/repository/event-repository";
import {UserRepository} from "../../service/repository/user-repository";
import {OnlineRepository} from "../../service/repository/online-repository";
import {MessageService} from "../../service/message-service";
import {AccountRepository} from "../../service/auth/account-repository";
import EventCache from "../../service/cache/data/event-cache";
import ProfileService from "../../service/profile-service";
import {SearchRepository} from "../../service/repository/search-repository";

@Component({
      selector: 'app-home',
      standalone: false,

      templateUrl: './home.component.html',
      styleUrl: './home.component.css',
      providers: [
            ChatRepository,
            EventCache,
            DialogRepository,
            EventRepository,
            UserRepository,
            OnlineRepository,
            RealtimeClient,
            MessageService,
            ProfileService,
            SearchRepository
      ]
})
export class HomeComponent implements OnInit, OnDestroy {


      constructor(
              private readonly accountRepository: AccountRepository,
              stompClient: RealtimeClient,
              private readonly router: Router,
              private readonly snackBar: MatSnackBar) {
      }

      ngOnDestroy(): void {
      }

      ngOnInit(): void {
      }

}
