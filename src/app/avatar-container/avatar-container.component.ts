import {Component, Input} from '@angular/core';
import {ONE_HOUR_SECONDS, ONE_MINUTE_SECONDS} from "../core/utils/time";
import {CommonModule} from "@angular/common";
import {MatBadgeModule} from "@angular/material/badge";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";

@Component({
      selector: 'app-avatar-container',
      imports: [CommonModule, MatBadgeModule, MatButtonModule, MatIconModule],
      templateUrl: './avatar-container.component.html',
      styleUrl: './avatar-container.component.css'
})
export class AvatarContainerComponent {

      protected readonly ONE_HOUR_SECONDS = ONE_HOUR_SECONDS;
      protected readonly ONE_MINUTE_SECONDS = ONE_MINUTE_SECONDS;
      protected readonly Math = Math;
      @Input() onlineAt!: number;
      @Input() size!: string;
      @Input() avatarUri!: string;

      protected get diffOnline(): number {
            return Date.now() / 1000 - this.onlineAt
      }

}
