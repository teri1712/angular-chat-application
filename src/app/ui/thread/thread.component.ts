import {Component} from '@angular/core';
import {RouterOutlet} from "@angular/router";
import {SearchBarComponent} from "../search-bar/search-bar.component";
import {BuddyListComponent} from "../buddy/buddy-list.component";

@Component({
      selector: 'app-thread',
      imports: [
            RouterOutlet,
            SearchBarComponent,
            BuddyListComponent
      ],
      templateUrl: './thread.component.html',
      styleUrl: './thread.component.css'
})
export class ThreadComponent {

}
