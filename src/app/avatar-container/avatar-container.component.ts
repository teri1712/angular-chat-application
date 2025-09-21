import {Component, HostListener, Input, OnChanges, SimpleChanges} from '@angular/core';
import {ONE_HOUR_SECONDS, ONE_MINUTE_SECONDS} from "../usecases/utils/time";
import {CommonModule} from "@angular/common";
import {MatBadgeModule} from "@angular/material/badge";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {Conversation} from "../model/conversation";
import {Router} from "@angular/router";
import {DialogRepository} from "../usecases/service/repository/dialog-repository";

@Component({
      selector: 'app-avatar-container',
      imports: [CommonModule, MatBadgeModule, MatButtonModule, MatIconModule],
      templateUrl: './avatar-container.component.html',
      styleUrl: './avatar-container.component.css'
})
export class AvatarContainerComponent implements OnChanges {

      protected readonly ONE_HOUR_SECONDS = ONE_HOUR_SECONDS;
      protected readonly ONE_MINUTE_SECONDS = ONE_MINUTE_SECONDS;
      protected readonly Math = Math;
      @Input() onlineAt!: number;
      @Input() size!: string;
      @Input() conversation!: Conversation;

      protected diffOnline!: number;

      constructor(private router: Router, private dialogRepository: DialogRepository) {

      }

      ngOnChanges(changes: SimpleChanges): void {
            if (changes['onlineAt']) {
                  this.diffOnline = Date.now() / 1000 - this.onlineAt;
            }
      }


      @HostListener('click', ['$event'])
      onClick(event: MouseEvent) {
            event.stopPropagation();
            this.dialogRepository.get(this.conversation)
            this.router.navigate(['/home', {
                  outlets: {
                        'conversation': [this.conversation.identifier.toString()]
                  }
            }])
      }

}
