import {Component, Input} from '@angular/core';
import {Conversation} from "../model/conversation";
import {AvatarContainerComponent} from "../avatar-container/avatar-container.component";
import {User} from "../model/user";

@Component({
      selector: 'app-search-item',
      imports: [
            AvatarContainerComponent
      ],
      templateUrl: './search-item.component.html',
      styleUrl: './search-item.component.css'
})
export class SearchItemComponent {
      @Input() conversation!: Conversation;

      protected get partner(): User {
            return this.conversation.partner
      }
}
