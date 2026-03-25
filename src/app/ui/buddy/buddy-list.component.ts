import {Component, OnDestroy, OnInit} from '@angular/core';
import {PresenceRepository} from "../../service/repository/presence-repository.service";
import {CommonModule} from "@angular/common";
import {interval, Subscription} from "rxjs";
import {BuddyPresence} from "../../model/dto/buddyPresence";
import {BuddyComponent} from "../buddy-list/buddy.component";

@Component({
      selector: 'app-buddy-list',
      templateUrl: './buddy-list.component.html',
      imports: [
            CommonModule, BuddyComponent
      ],
      styleUrls: ['./buddy-list.component.css']
})
export class BuddyListComponent implements OnInit, OnDestroy {

      protected buddies: BuddyPresence[] = [];
      private timerSubscription?: Subscription;

      constructor(private presenceRepository: PresenceRepository,) {
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
            this.presenceRepository.list().subscribe(buddies => {
                  this.buddies = buddies
            });
      }


}

