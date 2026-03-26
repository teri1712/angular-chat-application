import {Component, HostBinding, Input, OnInit} from '@angular/core';
import {IconMessageComponent} from "../icon-message/icon-message.component";
import {CommonModule} from "@angular/common";
import {TextMessageComponent} from "../text-message/text-message.component";
import {ImageMessageComponent} from "../image-message/image-message.component";
import {FileMessageComponent} from "../file-message/file-message.component";
import {MessageFrame, Position} from "../format/Formatter";
import {MessageState} from "../../model/dto/message-state";
import {SendState} from "../../model/message";
import ProfileService from "../../service/profile-service";
import {User} from "../../model/dto/user";

@Component({
      selector: 'app-right-message',
      imports: [
            IconMessageComponent,
            CommonModule,
            TextMessageComponent,
            ImageMessageComponent,
            FileMessageComponent
      ],
      templateUrl: './right-message.component.html',
      styleUrl: './right-message.component.css'
})
export class RightMessageComponent implements OnInit {


      constructor(private readonly profileService: ProfileService) {
      }

      ngOnInit(): void {
      }

      @Input({required: true,}) message!: MessageState
      @Input({required: true,}) frame!: MessageFrame
      @Input({required: true,}) sendState?: SendState
      @Input({required: true,}) displaySend?: boolean

      get displaySeenBy(): User[] {
            return this.message.seenBy.filter(user => !this.profileService.thatsMe(user))
      }

      protected get hasError(): boolean {
            return 'reason' in this.message
      }

      /**
       * In error state: tint the whole right-message subtree with the error
       * colour so icon, bubble and status text all turn red.
       */
      @HostBinding('style.--mat-sys-primary')
      get primaryOverride() {
            return this.hasError ? 'var(--mat-sys-error)' : null;
      }

      /**
       * Outgoing bubble background = primary colour (chat-theme or app default).
       * Error state: red bubble.
       */
      @HostBinding('style.--mat-sys-neutral-variant60')
      get neutralOverride() {
            return this.hasError ? 'var(--mat-sys-error)' : 'var(--mat-sys-primary)';
      }

      /**
       * Text inside the outgoing bubble uses on-primary for legibility.
       * Error state: on-error text.
       */
      @HostBinding('style.color')
      get textOverride() {
            return this.hasError ? 'var(--mat-sys-on-error)' : 'var(--mat-sys-on-primary)';
      }

      protected readonly Position = Position;

      protected readonly SendState = SendState;
}
