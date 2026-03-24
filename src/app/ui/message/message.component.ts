import {Component, Input, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {LeftMessageComponent} from "../left-message/left-message.component";
import {RightMessageComponent} from "../right-message/right-message.component";
import {FormatTimePipe} from "../pipes/FormatTimePipe";
import ProfileService from "../../service/profile-service";
import {MessageFrame} from "../format/Formatter";
import {PreferenceMessageComponent} from "../preference-message/preference-message.component";
import {MessageState} from "../../model/dto/message-state";
import {SendMessage} from "../pipes/sent-message.pipe";
import {GroupMessageComponent} from "../group-message/group-message.component";

@Component({
      selector: 'app-message',
      imports: [
            CommonModule,
            FormatTimePipe,
            LeftMessageComponent,
            RightMessageComponent,
            PreferenceMessageComponent,
            GroupMessageComponent
      ],
      templateUrl: './message.component.html',
      styleUrl: './message.component.css'
})
export class MessageComponent implements OnInit {
      @Input({required: true,}) send?: SendMessage
      @Input({required: true,}) mine!: boolean
      @Input({required: true,}) message!: MessageState
      @Input({required: true,}) frame!: MessageFrame


      constructor(profileService: ProfileService) {
      }

      ngOnInit(): void {
      }


}
