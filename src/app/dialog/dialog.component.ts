import {Component, HostListener, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {Conversation} from "../model/conversation";
import {Router} from "@angular/router";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {MatBadgeModule} from "@angular/material/badge";
import {formatRelativeTime, ONE_HOUR_SECONDS, ONE_MINUTE_SECONDS} from "../core/utils/time";
import {Message} from "../model/message";
import {User} from "../model/user";
import {announcementOf} from "../core/utils/notification";
import {CommonModule} from "@angular/common";
import {AvatarContainerComponent} from "../avatar-container/avatar-container.component";

@Component({
      selector: 'app-dialog',
      imports: [CommonModule, AvatarContainerComponent, MatBadgeModule, MatButtonModule, MatIconModule],
      templateUrl: './dialog.component.html',
      styleUrl: './dialog.component.css'
})
export class DialogComponent implements OnInit, OnChanges {

      @Input() conversation!: Conversation;
      @Input() newest?: Message;
      @Input() onlineAt!: number;

      protected partner!: User;

      protected get mine(): boolean {
            return this.newest ? this.conversation.isOfOwner(this.newest) : false;
      }

      protected get seen(): boolean {
            return this.newest ? this.newest.seen : false;
      }

      protected get nameWeight(): string {
            return !this.seen && !this.mine ? 'bold' : '500'
      }

      protected get contentWeight(): string {
            return !this.seen && !this.mine ? 'bold' : 'normal'
      }

      protected messageText!: string;

      constructor(private router: Router) {
      }

      ngOnChanges(changes: SimpleChanges): void {
            if (!!this.newest) {
                  this.messageText = announcementOf(this.conversation, this.newest)
            }
      }

      ngOnInit(): void {
            this.partner = this.conversation.partner;
      }

      @HostListener('click')
      onClick() {
            this.router.navigate(['/home', {
                  outlets: {
                        'conversation': [this.conversation.identifier.toString()]
                  }
            }])
      }

      protected readonly formatRelativeTime = formatRelativeTime;
      protected readonly Date = Date;

      protected readonly ONE_HOUR_SECONDS = ONE_HOUR_SECONDS;
      protected readonly ONE_MINUTE_SECONDS = ONE_MINUTE_SECONDS;
      protected readonly Math = Math;
}
