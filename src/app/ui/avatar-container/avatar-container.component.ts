import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {ONE_HOUR_SECONDS, ONE_MINUTE_SECONDS} from "../../utils/time";
import {CommonModule, NgOptimizedImage} from "@angular/common";
import {MatBadgeModule} from "@angular/material/badge";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {Router} from "@angular/router";
import {DirectRepository} from "../../service/repository/chat-repository";

@Component({
      selector: 'app-avatar-container',
      imports: [CommonModule, MatBadgeModule, MatButtonModule, MatIconModule, NgOptimizedImage],
      templateUrl: './avatar-container.component.html',
      styleUrl: './avatar-container.component.css'
})
export class AvatarContainerComponent implements OnChanges {

      protected readonly ONE_HOUR_SECONDS = ONE_HOUR_SECONDS;
      protected readonly ONE_MINUTE_SECONDS = ONE_MINUTE_SECONDS;
      protected readonly Math = Math;
      @Input() size!: string;
      @Input() presence: Date | null = null;
      @Input() avatar: string | null = null;

      @Input() directId: string | null = null;
      @Input() chatId: string | null = null;

      protected diffOnline: number = 100000000;

      constructor(private router: Router, private directRepository: DirectRepository) {

      }

      ngOnChanges(changes: SimpleChanges): void {
            if (changes['presence']) {
                  this.diffOnline = Date.now() / 1000 - (this.presence ?? new Date(0)).getTime() / 1000;
            }
      }


}
