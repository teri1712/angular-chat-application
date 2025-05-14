import {Component, Input, OnInit} from '@angular/core';
import {Message} from "../model/message";
import {CommonModule} from "@angular/common";
import {User} from "../model/user";
import {LeftMessageComponent} from "../left-message/left-message.component";
import {RightMessageComponent} from "../right-message/right-message.component";
import {TypeEvent} from "../model/type-event";
import {isMessage, toOwnerMessage} from "../core/utils/item-type-check";
import {AccountManager} from "../core/service/auth/account-manager";
import {FormatTimePipe} from "../core/utils/pipes/FormatTimePipe";

@Component({
      selector: 'app-message',
      imports: [
            CommonModule,
            FormatTimePipe,
            LeftMessageComponent,
            RightMessageComponent
      ],
      templateUrl: './message.component.html',
      styleUrl: './message.component.css'
})
export class MessageComponent implements OnInit {
      @Input({required: true,}) message!: Message | TypeEvent
      @Input({required: true,}) partner!: User
      protected user: User


      constructor(accountManager: AccountManager) {
            this.user = accountManager.user!
      }

      ngOnInit(): void {
      }


      protected get mine(): boolean {
            return isMessage(this.message)
                    && this.user.id === this.message.sender
      }

      protected readonly isMessage = isMessage;
      protected readonly toOwnerMessage = toOwnerMessage;
}
