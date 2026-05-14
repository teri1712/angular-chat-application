import {Component, computed, input} from '@angular/core';
import {IconState} from "../../model/dto/icon-state";
import {getIcon} from "../../res/icons";
import {MatIcon} from "@angular/material/icon";

@Component({
    selector: 'app-icon-message',
    imports: [
        MatIcon
    ],
    templateUrl: './icon-message.component.html',
    styleUrl: './icon-message.component.css'
})
export class IconMessageComponent {
    iconState = input.required<IconState>();
    iconName = computed(() => getIcon(this.iconState().iconId))

    constructor() {
    }
}
