import {Component, Input} from '@angular/core';
import {User} from "../../model/dto/user";
import {CommonModule} from "@angular/common";

@Component({
      selector: 'app-preference-message',
      imports: [CommonModule],
      templateUrl: './preference-message.component.html',
      styleUrl: './preference-message.component.css'
})
export class PreferenceMessageComponent {
      @Input({required: true}) maker!: User;

      constructor() {
      }

}
