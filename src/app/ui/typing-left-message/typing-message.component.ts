import {Component, Input} from '@angular/core';
import {CommonModule} from "@angular/common";
import {TypeEvent} from "../../model/dto/type-event";
import {TypingComponent} from "../typing/typing.component";
import {User} from "../../model/dto/user";

@Component({
      selector: 'app-typing-message',
      imports: [
            CommonModule,
            TypingComponent
      ],
      templateUrl: './typing-message.component.html',
      styleUrl: './typing-message.component.css'
})
export class TypingMessageComponent {

      @Input({required: true,}) message!: TypeEvent

      @Input({required: true,}) partner!: User


}
