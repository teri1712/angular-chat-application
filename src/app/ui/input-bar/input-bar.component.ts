import {Component, DestroyRef, inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {FormsModule} from "@angular/forms";
import {MessageService} from "../../service/message-service";
import {Subscription, take, timer} from "rxjs";
import {getIcon} from "../../res/icons";
import {NgIf, NgStyle} from "@angular/common";
import {TextPosting} from "../../service/text-handler";
import {IconPosting} from "../../service/icon-handler";
import {FilePosting} from "../../service/file-handler";
import {ImagePosting} from "../../service/image-handler";
import {DialogService} from "../../service/repository/dialog.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Component({
      selector: 'app-input-bar',
      imports: [MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, FormsModule, NgStyle, NgIf],
      templateUrl: './input-bar.component.html',
      styleUrl: './input-bar.component.css'
})
export class InputBarComponent implements OnInit, OnDestroy, OnChanges {

      @Input({required: true}) chatId: string | null = null;
      @Input() iconId: number | null = null;
      protected textContent: string = ""
      protected lastChange: number = 0

      private typeTimer?: Subscription

      constructor(private readonly messageService: MessageService, private dialogService: DialogService) {
      }

      ngOnChanges(changes: SimpleChanges): void {
            if (changes['chatId']) {
                  this.textContent = ""
                  this.lastChange = 0
            }
      }


      private destroyRef = inject(DestroyRef);

      ngOnInit(): void {
            this.typeTimer = timer(1000, 1000).subscribe(() => {
                  if (Date.now() - this.lastChange <= 1000 && this.chatId) {
                        this.dialogService.findByChatId(this.chatId)
                                .pipe(
                                        take(1),
                                        takeUntilDestroyed(this.destroyRef)
                                )
                                .subscribe(dialog => {
                                      dialog.ping()
                                })
                  }
            })
      }

      ngOnDestroy(): void {
            this.typeTimer?.unsubscribe();
      }

      protected onChange(text: string) {
            const _empty = text.length == 0
            if (!_empty) {
                  this.lastChange = Date.now()
            }
      }

      protected onIconClicked() {
            if (!this.chatId || !this.iconId)
                  return
            this.messageService.send(new IconPosting(this.iconId, this.chatId))

            this.textContent = ""
      }

      protected onSendClicked(): void {
            if (!this.textContent || !this.chatId)
                  return
            this.messageService.send(new TextPosting(this.textContent, this.chatId))
            this.textContent = ""
      }

      protected sendFile(event: Event) {
            const files = (event.target as HTMLInputElement)?.files
            if (files?.length) {
                  const file = files[0];
                  if (this.chatId)
                        this.messageService.send(new FilePosting(file, this.chatId))
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
                        if (this.chatId)
                              this.messageService.send(new ImagePosting(file, width, height, format, this.chatId))
                  };
                  image.onerror = () => {
                        if (this.chatId)
                              this.messageService.send(new ImagePosting(file, 200, 200, format, this.chatId))
                  };
                  image.src = fileUrl;
            }
      }


      protected readonly getIcon = getIcon;
}
