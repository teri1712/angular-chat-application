import {Component, Input} from '@angular/core';
import {IconMessageComponent} from "../icon-message/icon-message.component";
import {ImageMessageComponent} from "../image-message/image-message.component";
import {CommonModule} from "@angular/common";
import {TextMessageComponent} from "../text-message/text-message.component";
import {FileMessageComponent} from "../file-message/file-message.component";
import {MessageState} from "../../model/dto/message-state";
import {MessageFrame, Position} from "../format/Formatter";

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

      @Input({required: true,}) message!: MessageState
      @Input({required: true,}) frame!: MessageFrame

      protected readonly Position = Position;
}
