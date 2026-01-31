import {Component, OnDestroy, OnInit} from '@angular/core';
import {OnlineRepository} from "../../service/repository/online-repository";
import {AvatarContainerComponent} from "../avatar-container/avatar-container.component";
import {CommonModule} from "@angular/common";
import {Router} from "@angular/router";
import {interval, Subscription} from "rxjs";
import {IDialog} from "../../model/IDialog";
import {DialogRepository} from "../../service/repository/dialog-repository";
import {User} from "../../model/dto/user";
import {Conversation} from "../../model/dto/conversation";
import ProfileService from "../../service/profile-service";

@Component({
      selector: 'app-online-user-list',
      templateUrl: './online-user-list.component.html',
      imports: [
            AvatarContainerComponent, CommonModule
      ],
      styleUrls: ['./online-user-list.component.css']
})
export class OnlineUserListComponent implements OnInit, OnDestroy {

      protected dialogs: IDialog[] = [];
      private timerSubscription?: Subscription;
      private readonly me: User

      constructor(private profileService: ProfileService, private onlineRepository: OnlineRepository, private dialogRepository: DialogRepository, private router: Router) {
            this.me = profileService.getProfile()
      }

      ngOnInit(): void {
            this.fetchOnlineUsers();
            this.timerSubscription = interval(30000).subscribe(() => {
                  this.fetchOnlineUsers();
            });
      }

      ngOnDestroy(): void {
            if (this.timerSubscription) {
                  this.timerSubscription.unsubscribe();
            }
      }

      private fetchOnlineUsers(): void {
            this.onlineRepository.list().subscribe(onlines => {
                  this.dialogs = onlines.map((online) => {
                        const partner = new User(online.userId, online.username, online.name, 1, "", online.avatar);
                        const conversation = Conversation.fromPartner(this.me, partner);
                        return this.dialogRepository.find(conversation)
                  });
            });
      }
}

