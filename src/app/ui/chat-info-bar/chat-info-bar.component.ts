import {Component, computed, DestroyRef, inject, Injector, input, signal} from '@angular/core';
import {ONE_HOUR_SECONDS, ONE_MINUTE_SECONDS} from "../../utils/time";
import {CommonModule} from "@angular/common";
import {AvatarContainerComponent} from "../avatar-container/avatar-container.component";
import {ChatSettingComponent} from '../chat-setting/chat-setting.component';
import {SearchDialogComponent} from "../search-dialog/search-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {switchMap} from "rxjs";
import {DialogService} from "../../service/repository/dialog.service";
import {rxResource} from "@angular/core/rxjs-interop";

@Component({
    selector: 'app-chat-info-bar',
    imports: [CommonModule, AvatarContainerComponent, ChatSettingComponent],
    templateUrl: './chat-info-bar.component.html',
    styleUrl: './chat-info-bar.component.css',
    standalone: true
})
export class ChatInfoBarComponent {

    private readonly matDialog = inject(MatDialog);
    private readonly dialogService = inject(DialogService);
    private readonly injector = inject(Injector);
    private readonly destroyRef = inject(DestroyRef);

    roomName = input.required<string>();
    presence = input<Date>();
    roomAvatar = input.required<string>();
    chatId = input.required<string>();

    private readonly now = signal(Date.now());

    preference = rxResource({
        params: () => {
            return ({
                chatId: this.chatId(),
            })
        },
        stream: (request) => {
            const params = request.params
            const chatId = params.chatId
            return this.dialogService.findByChatId(chatId)
                .pipe(switchMap((dialog) => dialog.preference))
        },
    });

    constructor() {
        const interval = setInterval(() => {
            this.now.set(Date.now());
        }, 1000);
        this.destroyRef.onDestroy(() => clearInterval(interval));
    }

    protected diffOnline = computed(() => {
        const presenceTime = this.presence()?.getTime();
        if (!presenceTime) return Number.MAX_SAFE_INTEGER;
        return (this.now() - presenceTime) / 1000;
    });

    protected openSearchDialog() {
        this.matDialog.open(SearchDialogComponent, {
            panelClass: 'modern-dialog',
            injector: this.injector,
            data: {
                chatId: this.chatId(),
            }
        })
    }

    protected readonly ONE_HOUR_SECONDS = ONE_HOUR_SECONDS;
    protected readonly ONE_MINUTE_SECONDS = ONE_MINUTE_SECONDS;
    protected readonly Math = Math;
}