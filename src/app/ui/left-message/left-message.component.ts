import {Component, input, TemplateRef} from '@angular/core';
import {CommonModule} from "@angular/common";
import {MessageState} from "../../model/dto/message-state";
import {MessageFrame, Position} from "../format/Formatter";

@Component({
    selector: 'app-left-message',
    imports: [
        CommonModule
    ],
    templateUrl: './left-message.component.html',
    styleUrl: './left-message.component.css'
})
export class LeftMessageComponent {

    message = input.required<MessageState>()
    frame = input.required<MessageFrame>()
    contentTemplate = input.required<TemplateRef<any>>()

    protected readonly Position = Position;

    constructor() {
    }
}
