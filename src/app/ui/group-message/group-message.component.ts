import {Component, Input} from '@angular/core';
import {User} from "../../model/dto/user";
import {CommonModule} from "@angular/common";

@Component({
      selector: 'app-group-message',
      imports: [CommonModule],
      templateUrl: './group-message.component.html',
      styleUrl: './group-message.component.css'
})
export class GroupMessageComponent {
      @Input({required: true}) creator!: User;

      constructor() {
      }

}
