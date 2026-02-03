import {Component, Input} from '@angular/core';
import {ONE_HOUR_SECONDS, ONE_MINUTE_SECONDS} from "../../utils/time";
import {CommonModule} from "@angular/common";
import {AvatarContainerComponent} from "../avatar-container/avatar-container.component";
import {MatIcon} from "@angular/material/icon";
import {ChatSettingComponent} from '../chat-setting/chat-setting.component';
import {IDialog} from "../../model/IDialog";
import {Conversation} from "../../model/dto/conversation";

@Component({
      selector: 'app-chat-info-bar',
      imports: [CommonModule, AvatarContainerComponent, MatIcon, ChatSettingComponent],
      templateUrl: './chat-info-bar.component.html',
      styleUrl: './chat-info-bar.component.css',
      standalone: true
})
export class ChatInfoBarComponent {
      @Input({required: true}) dialog!: IDialog

      protected get diffOnline(): number {
            return Date.now() / 1000 - this.dialog.onlineAt.getTime() / 1000
      }

      protected get conversation(): Conversation {
            return this.dialog.conversation
      }


      protected readonly ONE_HOUR_SECONDS = ONE_HOUR_SECONDS;
      protected readonly ONE_MINUTE_SECONDS = ONE_MINUTE_SECONDS;
      protected readonly Math = Math;
}