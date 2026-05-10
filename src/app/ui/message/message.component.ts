import {Component, input, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {FormatTimePipe} from "../pipes/FormatTimePipe";
import ProfileService from "../../service/profile-service";
import {MessageFrame} from "../format/Formatter";

@Component({
    selector: 'app-message',
    imports: [
        CommonModule,
        FormatTimePipe
    ],
    templateUrl: './message.component.html',
    styleUrl: './message.component.css'
})
export class MessageComponent implements OnInit {
    frame = input.required<MessageFrame>()


    constructor(profileService: ProfileService) {
    }

    ngOnInit(): void {
    }


}
