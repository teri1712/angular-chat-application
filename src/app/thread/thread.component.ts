import {Component} from '@angular/core';
import {RouterOutlet} from "@angular/router";
import {SearchBarComponent} from "../search-bar/search-bar.component";

@Component({
      selector: 'app-thread',
      imports: [
            RouterOutlet,
            SearchBarComponent
      ],
      templateUrl: './thread.component.html',
      styleUrl: './thread.component.css'
})
export class ThreadComponent {

}
