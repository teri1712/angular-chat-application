import {Component, Input, OnInit} from '@angular/core';
import {IconState} from "../../model/dto/icon-state";
import {getIcon} from "../../res/icons";
import {MatIcon} from "@angular/material/icon";

@Component({
      selector: 'app-icon-message',
      imports: [
            MatIcon
      ],
      templateUrl: './icon-message.component.html',
      styleUrl: './icon-message.component.css'
})
export class IconMessageComponent implements OnInit {
      @Input({required: true}) iconState!: IconState;
      protected iconName!: string

      constructor() {
      }

      ngOnInit(): void {
            this.iconName = getIcon(this.iconState.iconId)
      }
}
