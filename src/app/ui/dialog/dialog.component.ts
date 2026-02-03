import {Component, HostListener, Input} from '@angular/core';
import {Router} from "@angular/router";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {MatBadgeModule} from "@angular/material/badge";
import {CommonModule} from "@angular/common";
import {AvatarContainerComponent} from "../avatar-container/avatar-container.component";
import {IDialog} from "../../model/IDialog";
import {toIdString} from "../../model/dto/chat-identifier";
import {User} from "../../model/dto/user";
import ProfileService from "../../service/profile-service";

@Component({
      selector: 'app-dialog',
      imports: [CommonModule, AvatarContainerComponent, MatBadgeModule, MatButtonModule, MatIconModule],
      templateUrl: './dialog.component.html',
      styleUrl: './dialog.component.css'
})
export class DialogComponent {

      @Input() dialog!: IDialog;

      protected get nameWeight(): string {
            return !this.dialog.seen && !this.newestMine ? 'bold' : '500'
      }

      protected get contentWeight(): string {
            return !this.dialog.seen && !this.newestMine ? 'bold' : 'normal'
      }

      protected me: User

      constructor(private router: Router, private profileService: ProfileService) {
            this.me = profileService.getProfile()
      }


      protected get newestMine() {
            return this.dialog.newestFrom === this.me.id
      }

      @HostListener('click')
      onClick() {
            this.router.navigate(['/home', {
                  outlets: {
                        'conversation': [toIdString(this.dialog.conversation.chat.identifier)]
                  }
            }])
      }

      protected readonly Date = Date;
}
