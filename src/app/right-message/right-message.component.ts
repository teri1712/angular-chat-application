import {Component, Input} from '@angular/core';
import {OwnerMessage, Position} from "../model/message";
import {User} from "../model/user";
import {IconMessageComponent} from "../icon-message/icon-message.component";
import {CommonModule} from "@angular/common";
import {TextMessageComponent} from "../text-message/text-message.component";
import {ImageMessageComponent} from "../image-message/image-message.component";
import {AccountManager} from "../core/service/auth/account-manager";

@Component({
      selector: 'app-right-message',
      imports: [
            IconMessageComponent,
            CommonModule,
            TextMessageComponent,
            ImageMessageComponent
      ],
      templateUrl: './right-message.component.html',
      styleUrl: './right-message.component.css'
})
export class RightMessageComponent {

      @Input({required: true,}) message!: OwnerMessage
      protected user: User


      constructor(accountManager: AccountManager) {
            this.user = accountManager.user
      }

      protected readonly Position = Position;
}
