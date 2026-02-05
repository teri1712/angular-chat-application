import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {FormsModule} from "@angular/forms";
import {MessageService} from "../../service/message-service";
import {ImageEvent} from "../../model/dto/image-event";
import {Subscription, timer} from "rxjs";
import {getIcon} from "../../res/icons";
import {RealtimeClient} from "../../service/websocket/realtime-client.service";
import {TextEventFactory} from "../../service/TextEventFactory";
import {IconEventFactory} from "../../service/IconEventFactory";
import {FileEventFactory} from "../../service/FileEventFactory";
import {ImageEventFactory} from "../../service/ImageEventFactory";
import {ChatIdentifier} from "../../model/dto/chat-identifier";
import {IDialog} from "../../model/IDialog";
import {NgStyle} from "@angular/common";
import {UploadService} from "../../service/upload-service";

@Component({
      selector: 'app-input-bar',
      imports: [MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, FormsModule, NgStyle],
      templateUrl: './input-bar.component.html',
      styleUrl: './input-bar.component.css'
})
export class InputBarComponent implements OnInit, OnDestroy {


      @Input({required: true}) dialog!: IDialog;

      protected textEmpty: boolean = true
      protected textContent: string = ""
      protected lastChange: number = 0

      private typeTimer!: Subscription

      constructor(private readonly messageService: MessageService,
                  private readonly realtimeClient: RealtimeClient,
                  private readonly uploadService: UploadService,
                  private readonly textEventFactory: TextEventFactory,
                  private readonly iconEventFactory: IconEventFactory,
                  private readonly fileEventFactory: FileEventFactory,
                  private readonly imageEventFactory: ImageEventFactory
      ) {
      }

      protected get chat(): ChatIdentifier {
            return this.dialog.conversation.chat.identifier;
      }

      ngOnInit(): void {
            this.typeTimer = timer(0, 1000).subscribe(() => {
                  if (Date.now() - this.lastChange <= 1100) {
                        this.realtimeClient.pingChat(this.chat)
                  }
            })
      }

      ngOnDestroy(): void {
            this.typeTimer.unsubscribe();
      }

      protected onChange(text: string) {
            const _empty = text.length == 0
            if (_empty != this.textEmpty) {
                  this.textEmpty = _empty
            }
            if (!_empty) {
                  this.lastChange = Date.now()
            }
      }

      get conversation() {
            return this.dialog.conversation;
      }

      protected onSendClicked(): void {
            if (!this.textEmpty) {
                  this.messageService.send(this.textEventFactory.create(this.conversation, this.textContent))
            } else {
                  const iconId = this.dialog.preference?.iconId ?? 1
                  this.messageService.send(this.iconEventFactory.create(this.conversation, iconId))
            }
            this.textContent = ""
            this.textEmpty = true
      }

      protected sendFile(event: Event) {
            const files = (event.target as HTMLInputElement)?.files
            if (files?.length) {
                  const file = files[0];
                  this.messageService.send(this.fileEventFactory.create(this.conversation, file))
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
                        this.messageService.send(this.imageEventFactory.create(this.conversation, {
                              image: file,
                              width: width,
                              height: height,
                              format: format
                        }))
                  };
                  image.onerror = () => {
                        const imageEvent = new ImageEvent(fileUrl, file.name, 0, 0, format)
                        imageEvent.file = file
                        this.messageService.send(this.imageEventFactory.create(this.conversation, {
                              image: file,
                              width: 200,
                              height: 200,
                              format: format
                        }))
                  };
                  image.src = fileUrl;
            }
      }


      protected readonly getIcon = getIcon;
}
