import {Component} from '@angular/core';
import {ThemeService} from "../theme-service";

@Component({
      selector: 'app-settings',
      standalone: false,

      templateUrl: './settings.component.html',
      styleUrl: './settings.component.css'
})
export class SettingsComponent {
      constructor(public themeService: ThemeService) {
      }

}
