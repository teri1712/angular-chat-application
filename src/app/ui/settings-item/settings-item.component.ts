import {Component, Input} from '@angular/core';
import {MatIcon} from "@angular/material/icon";

@Component({
      selector: 'app-settings-item',
      imports: [
            MatIcon
      ],
      templateUrl: './settings-item.component.html',
      styleUrl: './settings-item.component.css'
})
export class SettingsItemComponent {
      @Input({
            required: true
      }) icon!: string;
      @Input({
            required: true
      }) info!: string;
}
