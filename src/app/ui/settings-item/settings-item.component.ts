import {Component, input} from '@angular/core';
import {MatIcon} from "@angular/material/icon";

@Component({
    selector: 'app-settings-item',
    imports: [
        MatIcon
    ],
    templateUrl: './settings-item.component.html',
    styleUrl: './settings-item.component.css'
})
export class SettingsItemComponent {
    icon = input.required<string>()
    info = input.required<string>()
}
