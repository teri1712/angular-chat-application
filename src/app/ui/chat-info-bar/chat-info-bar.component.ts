import {Component, inject, Injector, input} from '@angular/core';
import {ONE_HOUR_SECONDS, ONE_MINUTE_SECONDS} from "../../utils/time";
import {CommonModule} from "@angular/common";
import {AvatarContainerComponent} from "../avatar-container/avatar-container.component";
import {MatIcon} from "@angular/material/icon";
import {ChatSettingComponent} from '../chat-setting/chat-setting.component';
import {MatIconButton} from "@angular/material/button";
import {SearchDialogComponent} from "../search-dialog/search-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {switchMap} from "rxjs";
import {DialogService} from "../../service/repository/dialog.service";
import {rxResource} from "@angular/core/rxjs-interop";

@Component({
    selector: 'app-chat-info-bar',
    imports: [CommonModule, AvatarContainerComponent, MatIcon, ChatSettingComponent, MatIconButton],
    templateUrl: './chat-info-bar.component.html',
    styleUrl: './chat-info-bar.component.css',
    standalone: true
})
export class ChatInfoBarComponent {

    private readonly matDialog = inject(MatDialog);
    private readonly dialogService = inject(DialogService);
    private readonly injector = inject(Injector);

    roomName = input.required<string>();
    presence = input<Date>();
    roomAvatar = input.required<string>();
    chatId = input.required<string>();
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
    }

    protected get diffOnline(): number {
        return Date.now() / 1000 - (this.presence()?.getTime() ?? 0) / 1000
    }

    protected openSearchDialog() {
        this.matDialog.open(SearchDialogComponent, {
            width: '600px',
            maxWidth: '90vw',
            height: 'auto',
            maxHeight: '85vh',
            injector: this.injector,
            data: {
                chatId: this.chatId(),
            }
        });
    }

    protected readonly ONE_HOUR_SECONDS = ONE_HOUR_SECONDS;
    protected readonly ONE_MINUTE_SECONDS = ONE_MINUTE_SECONDS;
    protected readonly Math = Math;
}