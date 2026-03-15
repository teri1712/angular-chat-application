import {Component, HostListener, Input} from '@angular/core';
import {AvatarContainerComponent} from "../avatar-container/avatar-container.component";
import {CommonModule} from "@angular/common";
import {Router} from "@angular/router";
import {BuddyPresence} from "../../model/dto/buddyPresence";
import {DirectRepository} from "../../service/repository/chat-repository";

@Component({
      selector: 'app-buddy',
      templateUrl: './buddy.component.html',
      imports: [
            AvatarContainerComponent, CommonModule
      ],
      styleUrls: ['./buddy.component.css']
})
export class BuddyComponent {

      @Input({required: true}) buddy!: BuddyPresence;

      constructor(
              private directRepository: DirectRepository,
              private router: Router) {
      }

      protected inspectDate(dateString: string | null): Date {
            return dateString ? new Date(dateString) : new Date(0);
      }

      @HostListener('click', ['$event'])
      onClick(event: MouseEvent) {
            event.stopPropagation();
            this.directRepository.get(this.buddy.userId).subscribe(chatId => {
                  this.router.navigate(['/home', {
                                outlets: {
                                      'conversation': [chatId]
                                }
                          }],
                          {
                                queryParamsHandling: 'merge',
                                queryParams: {
                                      roomName: this.buddy.name,
                                      roomAvatar: this.buddy.avatar
                                }
                          })
            })
      }
}

