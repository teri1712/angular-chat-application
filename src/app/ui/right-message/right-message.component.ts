import {Component, HostBinding, inject, input, TemplateRef} from '@angular/core';
import {CommonModule} from "@angular/common";
import {MessageFrame, Position} from "../format/Formatter";
import {MessageState} from "../../model/dto/message-state";
import {ISendingMessage, SendState} from "../../model/message";
import ProfileService from "../../service/profile-service";
import {User} from "../../model/dto/user";

@Component({
    selector: 'app-right-message',
    imports: [
        CommonModule
    ],
    templateUrl: './right-message.component.html',
    styleUrl: './right-message.component.css'
})
export class RightMessageComponent {


    private readonly profileService = inject(ProfileService)
    message = input.required<MessageState>()
    frame = input.required<MessageFrame>()
    contentTemplate = input.required<TemplateRef<any>>()
    displaySend = input.required<boolean>()
    sendState = input.required<SendState>()

    constructor() {
    }

    get displaySeenBy(): User[] {
        return this.message().seenBy.filter(user => !this.profileService.thatsMe(user))
    }

    protected get hasError(): boolean {
        return 'reason' in this.message()
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
