import {Component, Input, OnInit} from '@angular/core';
import {IconEvent} from "../model/icon-event";
import {getIcon} from "../res/icons";
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
      @Input({required: true}) iconEvent!: IconEvent;
      protected iconName!: string

      ngOnInit(): void {
            this.iconName = getIcon(this.iconEvent.resourceId)
      }
}
