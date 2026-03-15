import {Component, Input} from '@angular/core';
import {TextState} from "../../model/dto/text-state";

@Component({
      selector: 'app-text-message',
      imports: [],
      templateUrl: './text-message.component.html',
      styleUrl: './text-message.component.css'
})
export class TextMessageComponent {
      @Input({required: true}) textState!: TextState;

      constructor() {
      }


}
