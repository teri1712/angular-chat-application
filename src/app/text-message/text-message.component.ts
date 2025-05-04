import {Component, Input} from '@angular/core';
import {TextEvent} from "../model/text-event";

@Component({
      selector: 'app-text-message',
      imports: [],
      templateUrl: './text-message.component.html',
      styleUrl: './text-message.component.css'
})
export class TextMessageComponent {
      @Input({required: true}) textEvent!: TextEvent;

      constructor() {
      }

}
