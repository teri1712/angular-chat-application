import {Component, Input} from '@angular/core';
import {Conversation} from "../../model/dto/conversation";
import {AvatarContainerComponent} from "../avatar-container/avatar-container.component";

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

      protected readonly Conversation = Conversation;
      protected readonly onlineAt = new Date(0);
}
