import {Component, effect, inject, input, signal, untracked} from '@angular/core';
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {FormsModule} from "@angular/forms";
import {MessageService} from "../../service/message-service";
import {timer} from "rxjs";
import {getIcon} from "../../res/icons";
import {NgStyle} from "@angular/common";
import {TextPosting} from "../../service/text-handler";
import {IconPosting} from "../../service/icon-handler";
import {FilePosting} from "../../service/file-handler";
import {ImagePosting} from "../../service/image-handler";
import {DialogService} from "../../service/repository/dialog.service";
import {rxResource} from "@angular/core/rxjs-interop";

@Component({
    selector: 'app-input-bar',
    imports: [MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, FormsModule, NgStyle],
    templateUrl: './input-bar.component.html',
    styleUrl: './input-bar.component.css'
})
export class InputBarComponent {

    chatId = input.required<string>();
    iconId = input.required<number>();
    private readonly messageService = inject(MessageService);
    private readonly dialogService = inject(DialogService);

    protected textContent = signal('')
    protected lastChange = signal(0)

    dialog = rxResource({
        params: () => {
            return ({
                chatId: this.chatId(),
            })
        },
        stream: (request) => {
            const params = request.params
            const chatId = params.chatId
            return this.dialogService.findByChatId(chatId)
        },
    });

    constructor() {
        effect(() => {
            if (this.chatId()) {
                untracked(() => {
                    this.textContent.set('')
                    this.lastChange.set(0)
                })
            }
        });
        effect((onCleanup) => {
            const dialog = this.dialog.value()
            if (dialog) {
                const sub = timer(1000, 1000).subscribe(() => {
                    if (Date.now() - this.lastChange() <= 1000 && this.chatId()) {
                        dialog.ping()
                    }
                })
                onCleanup(() => sub.unsubscribe())
            }
        });
    }


    protected onChange(text: string) {
        if (text.length) {
            this.lastChange.set(Date.now())
        }
        this.textContent.set(text)
    }

    protected onIconClicked() {
        this.messageService.send(new IconPosting(this.iconId(), this.chatId()))
    }

    protected onSendClicked(): void {
        if (!this.textContent || !this.chatId)
            return
        this.messageService.send(new TextPosting(this.textContent(), this.chatId()))
        this.textContent.set("")
    }

    protected sendFile(event: Event) {
        const files = (event.target as HTMLInputElement)?.files
        if (files?.length) {
            const file = files[0];
            this.messageService.send(new FilePosting(file, this.chatId()))
        }
    }


    protected sendImage(event: Event) {
        const files = (event.target as HTMLInputElement)?.files
        if (files?.length) {
            const file = files[0];
            const fileUrl = URL.createObjectURL(file)
            const format = file.type?.split('/')?.[1] ?? 'jpg'
            const image = new Image();
            image.onload = () => {
                const width = image.naturalWidth || 0;
                const height = image.naturalHeight || 0;
                this.messageService.send(new ImagePosting(file, width, height, format, this.chatId()))
            };
            image.onerror = () => {
                this.messageService.send(new ImagePosting(file, 200, 200, format, this.chatId()))
            };
            image.src = fileUrl;
        }
    }


    protected readonly getIcon = getIcon;
}
