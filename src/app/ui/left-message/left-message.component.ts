import {Component, Input} from '@angular/core';
import {IMessage, Position} from "../../model/IMessage";
import {User} from "../../model/dto/user";
import {IconMessageComponent} from "../icon-message/icon-message.component";
import {ImageMessageComponent} from "../image-message/image-message.component";
import {CommonModule} from "@angular/common";
import {TextMessageComponent} from "../text-message/text-message.component";
import {FileMessageComponent} from "../file-message/file-message.component";

@Component({
      selector: 'app-left-message',
      imports: [
            IconMessageComponent,
            CommonModule,
            TextMessageComponent,
            ImageMessageComponent,
            FileMessageComponent
      ],
      templateUrl: './left-message.component.html',
      styleUrl: './left-message.component.css'
})
export class LeftMessageComponent {

      @Input({required: true,}) message!: IMessage
      @Input({required: true,}) partner!: User

      protected readonly Position = Position;
}
