import {Component, computed, HostListener, inject, input} from '@angular/core';
import {Router} from "@angular/router";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {MatBadgeModule} from "@angular/material/badge";
import {CommonModule} from "@angular/common";
import {AvatarContainerComponent} from "../avatar-container/avatar-container.component";
import ProfileService from "../../service/profile-service";
import {switchMap} from "rxjs";
import {DialogService} from "../../service/repository/dialog.service";
import {toObservable, toSignal} from "@angular/core/rxjs-interop";
import {MessageState} from "../../model/dto/message-state";
import {PREVIEWER} from "../../service/preview/previewer";
import {providePreviewers} from "../../service/preview/provide-previewers";

@Component({
    selector: 'app-conversation',
    imports: [CommonModule, AvatarContainerComponent, MatBadgeModule, MatButtonModule, MatIconModule],
    providers: [providePreviewers()],
    templateUrl: './conversation.component.html',
    styleUrl: './conversation.component.css'
})
export class ConversationComponent {

    identifier = input.required<string>();
    roomName = input.required<string>();
    roomAvatar = input.required<string>();
    newest = input.required<MessageState>();
    initialPresence = input.required<Date>();

    private readonly router = inject(Router);
    private readonly profileService = inject(ProfileService);
    private readonly dialogService = inject(DialogService);
    private readonly previewers = inject(PREVIEWER);

    protected presence = toSignal(
        toObservable(this.identifier).pipe(
            switchMap(id => this.dialogService.findByChatId(id)),
            switchMap(dialog => dialog.presence),
        )
    );

    protected displayPresence = computed(() => this.presence() ?? this.initialPresence());

    protected sender = computed(() => this.newest().sender);
    protected seenBy = computed(() => this.newest().seenBy);
    protected mine = computed(() => this.profileService.thatsMe(this.sender()));
    protected seenByMe = computed(() => this.seenBy().some(user => this.profileService.thatsMe(user)));
    protected displaySeenBy = computed(() => this.seenBy().filter(user => !this.profileService.thatsMe(user)));
    protected nameWeight = computed(() => !this.seenByMe() && !this.mine() ? 'bold' : '500');
    protected contentWeight = computed(() => !this.seenByMe() && !this.mine() ? 'bold' : 'normal');

    protected preview = computed(() => {
        const messageState = this.newest();
        const prefix = this.profileService.thatsMe(messageState.sender) ? "You " : "";

        const previewer = this.previewers.find(p => p.supports(messageState.messageType));
        const content = previewer ? previewer.preview(messageState) : "Wtf";

        return prefix + content;
    });

    @HostListener('click')
    onClick() {
        this.router.navigate(['/home', {
                outlets: {
                    'conversation': [this.identifier()]
                },
            }],
            {
                queryParamsHandling: 'merge',
                queryParams: {
                    roomName: this.roomName(),
                    roomAvatar: this.roomAvatar(),
                    presence: this.initialPresence().toString()
                }
            })
    }
}
