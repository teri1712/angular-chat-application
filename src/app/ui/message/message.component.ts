import {Component, Input, OnInit} from '@angular/core';
import {IMessage, IMyMessage} from "../../model/IMessage";
import {CommonModule} from "@angular/common";
import {User} from "../../model/dto/user";
import {LeftMessageComponent} from "../left-message/left-message.component";
import {RightMessageComponent} from "../right-message/right-message.component";
import {FormatTimePipe} from "../pipes/FormatTimePipe";
import ProfileService from "../../service/profile-service";

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
      @Input({required: true,}) message!: IMessage
      @Input({required: true,}) partner!: User
      protected me: User


      constructor(profileService: ProfileService) {
            this.me = profileService.getProfile()
      }

      ngOnInit(): void {
      }


      protected get mine(): boolean {
            return this.message.sender === this.me.id
      }

      protected toOwnerMessage(): IMyMessage {
            return this.message as IMyMessage
      };
}
