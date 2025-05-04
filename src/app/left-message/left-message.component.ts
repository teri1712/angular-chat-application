import {Component, Input} from '@angular/core';
import {Message, Position} from "../model/message";
import {User} from "../model/user";
import {IconMessageComponent} from "../icon-message/icon-message.component";
import {ImageMessageComponent} from "../image-message/image-message.component";
import {CommonModule} from "@angular/common";
import {TextMessageComponent} from "../text-message/text-message.component";
import {TypeEvent} from "../model/type-event";
import {TypeMessageComponent} from "../type-message/type-message.component";
import {isMessage, isTyping} from "../core/utils/item-type-check";
import {AccountManager} from "../core/service/auth/account-manager";

@Component({
      selector: 'app-left-message',
      imports: [
            IconMessageComponent,
            CommonModule,
            TextMessageComponent,
            ImageMessageComponent,
            TypeMessageComponent
      ],
      templateUrl: './left-message.component.html',
      styleUrl: './left-message.component.css'
})
export class LeftMessageComponent {

      @Input({required: true,}) message!: Message | TypeEvent
      protected user: User
      @Input({required: true,}) partner!: User


      constructor(accountManager: AccountManager) {
            this.user = accountManager.user!
      }

      protected readonly Position = Position;
      protected readonly isMessage = isMessage;
      protected readonly isTyping = isTyping;
}
