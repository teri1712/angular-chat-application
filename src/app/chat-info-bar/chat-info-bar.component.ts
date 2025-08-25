import {Component, Input} from '@angular/core';
import {User} from "../model/user";
import {ONE_HOUR_SECONDS, ONE_MINUTE_SECONDS} from "../usecases/utils/time";
import {CommonModule} from "@angular/common";
import {AvatarContainerComponent} from "../avatar-container/avatar-container.component";
import {MatIcon} from "@angular/material/icon";
import {AccountManager} from "../usecases/service/auth/account-manager";
import {Chat} from '../model/chat';
import {ChatSettingComponent} from '../chat-setting/chat-setting.component';
import {Conversation} from "../model/conversation";

@Component({
      selector: 'app-chat-info-bar',
      imports: [CommonModule, AvatarContainerComponent, MatIcon, ChatSettingComponent],
      templateUrl: './chat-info-bar.component.html',
      styleUrl: './chat-info-bar.component.css',
      standalone: true
})
export class ChatInfoBarComponent {
      protected readonly user: User;
      @Input({required: true}) conversation!: Conversation

      @Input() onlineAt: number = 0;

      protected get diffOnline(): number {
            return Date.now() / 1000 - this.onlineAt
      }

      protected get chat(): Chat {
            return this.conversation.chat
      }

      constructor(accountManager: AccountManager) {
            this.user = accountManager.user
      }

      protected readonly ONE_HOUR_SECONDS = ONE_HOUR_SECONDS;
      protected readonly ONE_MINUTE_SECONDS = ONE_MINUTE_SECONDS;
      protected readonly Math = Math;
}