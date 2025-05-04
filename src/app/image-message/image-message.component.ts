import {Component, Input} from '@angular/core';
import {ImageEvent} from "../model/image-event";
import {CommonModule} from "@angular/common";

@Component({
      selector: 'app-image-message',
      imports: [CommonModule],
      templateUrl: './image-message.component.html',
      styleUrl: './image-message.component.css'
})
export class ImageMessageComponent {
      @Input({required: true}) imageEvent!: ImageEvent;
}
