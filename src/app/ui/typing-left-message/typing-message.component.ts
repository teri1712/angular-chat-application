import {Component, input} from '@angular/core';
import {CommonModule} from "@angular/common";
import {TypeMessage} from "../../model/dto/type-message";
import {TypingComponent} from "../typing/typing.component";

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

    message = input.required<TypeMessage>()

}
