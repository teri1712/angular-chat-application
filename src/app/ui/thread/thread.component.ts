import {Component} from '@angular/core';
import {RouterOutlet} from "@angular/router";
import {SearchBarComponent} from "../search-bar/search-bar.component";
import {OnlineUserListComponent} from "../online-user-list/online-user-list.component";

@Component({
      selector: 'app-thread',
      imports: [
            RouterOutlet,
            SearchBarComponent,
            OnlineUserListComponent
      ],
      templateUrl: './thread.component.html',
      styleUrl: './thread.component.css'
})
export class ThreadComponent {

}
