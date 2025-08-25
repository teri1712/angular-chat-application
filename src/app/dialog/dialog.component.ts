import {Component, HostListener, Input, OnInit} from '@angular/core';
import {Conversation} from "../model/conversation";
import {Router} from "@angular/router";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {MatBadgeModule} from "@angular/material/badge";
import {Message} from "../model/message";
import {User} from "../model/user";
import {CommonModule} from "@angular/common";
import {AvatarContainerComponent} from "../avatar-container/avatar-container.component";
import {AnnouncementPipe} from "../usecases/utils/pipes/AnnouncementPipe";

@Component({
      selector: 'app-dialog',
      imports: [CommonModule, AvatarContainerComponent, MatBadgeModule, MatButtonModule, MatIconModule, AnnouncementPipe],
      templateUrl: './dialog.component.html',
      styleUrl: './dialog.component.css'
})
export class DialogComponent implements OnInit {

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


      constructor(private router: Router) {
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

      protected readonly Date = Date;
}
