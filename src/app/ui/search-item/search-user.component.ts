import {Component, EventEmitter, HostListener, Input, Output} from '@angular/core';
import {AvatarContainerComponent} from "../avatar-container/avatar-container.component";
import {User} from "../../model/dto/user";
import {DirectRepository} from "../../service/repository/chat-repository";
import {Router} from "@angular/router";

@Component({
      selector: 'app-search-user',
      imports: [
            AvatarContainerComponent
      ],
      templateUrl: './search-user.component.html',
      styleUrl: './search-user.component.css'
})
export class SearchUserComponent {
      @Input() user!: User;
      @Output() selected = new EventEmitter<void>();

      protected readonly onlineAt = new Date(0);

      constructor(private directRepository: DirectRepository, private router: Router) {
      }


      @HostListener('click', ['$event'])
      onClick(event: MouseEvent) {
            event.stopPropagation();
            this.selected.emit();
            this.directRepository.get(this.user.id).subscribe(chatId => {
                  this.router.navigate(['/home', {
                                outlets: {
                                      'conversation': [chatId]
                                }
                          }],

                          {
                                queryParamsHandling: 'merge',
                                queryParams: {
                                      roomName: this.user.name,
                                      roomAvatar: this.user.avatar
                                }
                          })
            })
      }
}
