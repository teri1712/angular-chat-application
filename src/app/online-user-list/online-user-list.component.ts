import {Component, OnDestroy, OnInit} from '@angular/core';
import {Online} from "../model/Online";
import {OnlineRepository} from "../usecases/service/repository/online-repository";
import {AvatarContainerComponent} from "../avatar-container/avatar-container.component";
import {CommonModule} from "@angular/common";
import {Router} from "@angular/router";
import {interval, Subscription} from "rxjs";

@Component({
      selector: 'app-online-user-list',
      templateUrl: './online-user-list.component.html',
      imports: [
            AvatarContainerComponent, CommonModule
      ],
      styleUrls: ['./online-user-list.component.css']
})
export class OnlineUserListComponent implements OnInit, OnDestroy {

      onlines: Online[] = [];
      private timerSubscription?: Subscription;

      constructor(private onlineRepository: OnlineRepository, private router: Router) {
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
                  this.onlines = onlines;
            });
      }

}