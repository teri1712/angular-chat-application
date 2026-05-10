import {Component, computed, inject, Injector} from '@angular/core';
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
    private readonly themeService = inject(ThemeService);
    private readonly dialog = inject(MatDialog);
    private readonly injector = inject(Injector);

    light = computed(() => this.themeService.theme() === 'light')

    openProfileManagement() {
        this.dialog.open(ProfileManagementComponent, {
            width: '800px',
            maxWidth: '95vw',
            maxHeight: '90vh',
            injector: this.injector
        });
    }

    protected toggle() {
        this.themeService.setTheme(this.light() ? 'dark' : 'light');
    }
}
