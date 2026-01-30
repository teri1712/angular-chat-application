import {Component, Injector} from '@angular/core';
import {ThemeService} from "../../service/theme-service";
import {MatDialog} from "@angular/material/dialog";
import {ProfileManagementComponent} from "../profile-management/profile-management.component";

@Component({
      selector: 'app-settings',
      standalone: false,

      templateUrl: './settings.component.html',
      styleUrl: './settings.component.css'
})
export class SettingsComponent {
      constructor(public themeService: ThemeService, private dialog: MatDialog, private injector: Injector) {
      }

      openProfileManagement() {
            this.dialog.open(ProfileManagementComponent, {
                  width: '800px',
                  maxWidth: '95vw',
                  maxHeight: '90vh',
                  injector: this.injector
            });
      }

}
