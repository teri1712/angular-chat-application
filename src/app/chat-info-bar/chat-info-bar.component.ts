import {Component, Input} from '@angular/core';
import {User} from "../model/user";
import {ONE_HOUR_SECONDS, ONE_MINUTE_SECONDS} from "../core/utils/time";
import {CommonModule} from "@angular/common";
import {AvatarContainerComponent} from "../avatar-container/avatar-container.component";
import {MatIcon} from "@angular/material/icon";
import {AccountManager} from "../core/service/auth/account-manager";

@Component({
      selector: 'app-chat-info-bar',
      imports: [CommonModule, AvatarContainerComponent, MatIcon],
      templateUrl: './chat-info-bar.component.html',
      styleUrl: './chat-info-bar.component.css'
})
export class ChatInfoBarComponent {
      protected readonly user: User;
      @Input({required: true}) partner!: User

      @Input() onlineAt: number = 0;

      protected get diffOnline(): number {
            return Date.now() / 1000 - this.onlineAt
      }

      constructor(accountManager: AccountManager) {
            this.user = accountManager.user
      }

      protected readonly ONE_HOUR_SECONDS = ONE_HOUR_SECONDS;
      protected readonly ONE_MINUTE_SECONDS = ONE_MINUTE_SECONDS;
      protected readonly Math = Math;
}