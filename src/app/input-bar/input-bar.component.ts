import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {FormsModule} from "@angular/forms";
import {NgStyle} from "@angular/common";
import {MessageService} from "../usecases/service/message-service";
import {Conversation} from "../model/conversation";
import {TextEvent} from "../model/text-event";
import {IconEvent} from "../model/icon-event";
import {ImageEvent} from "../model/image-event";
import {ImageSpec} from "../model/image-spec";
import {ChatSubscription} from "../usecases/service/websocket/chat-subscription";
import {Subscription, timer} from "rxjs";
import {getIcon} from "../res/icons";
import {FileEvent} from "../model/file-event";
import {
      FileEventHandlerStrategy,
      IconEventHandlerStrategy,
      ImageEventHandlerStrategy,
      TextEventHandlerStrategy
} from "../usecases/service/event-handler.strategy";

@Component({
      selector: 'app-input-bar',
      imports: [MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, FormsModule, NgStyle],
      templateUrl: './input-bar.component.html',
      styleUrl: './input-bar.component.css'
})
export class InputBarComponent implements OnInit, OnDestroy {


      @Input({required: true}) conversation!: Conversation;
      @Input() chatSubscription?: ChatSubscription;

      protected textEmpty: boolean = true
      protected textContent: string = ""
      protected lastChange: number = 0
      private typeTimer!: Subscription

      constructor(private readonly messageService: MessageService) {
      }

      ngOnInit(): void {
            this.typeTimer = timer(0, 1000).subscribe(() => {
                  if (Date.now() - this.lastChange <= 1100) {
                        this.chatSubscription?.ping()
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

      get isPreferenceDefined(): boolean {
            return !!this.conversation.chat.preference;
      }

      protected onSendClicked(): void {
            if (!this.textEmpty) {
                  this.messageService.send(this.conversation, new TextEventHandlerStrategy(new TextEvent(this.textContent)))
            } else {
                  this.messageService.send(this.conversation, new IconEventHandlerStrategy(new IconEvent(this.conversation.chat.preference!.resourceId)))
            }
            this.textContent = ""
            this.textEmpty = true
      }

      protected sendFile(event: Event) {
            const files = (event.target as HTMLInputElement)?.files
            if (files?.length) {
                  const file = files[0];
                  const fileUrl = URL.createObjectURL(file)
                  const fileEvent = new FileEvent(fileUrl, file.name, file.size)
                  fileEvent.file = file
                  this.messageService.send(this.conversation, new FileEventHandlerStrategy(fileEvent))
            }
      }


      protected sendImage(event: Event) {
            const files = (event.target as HTMLInputElement)?.files
            if (files?.length) {
                  const file = files[0];
                  const fileUrl = URL.createObjectURL(file)
                  const imageEvent = new ImageEvent(new ImageSpec(fileUrl, file.name))
                  imageEvent.file = file
                  this.messageService.send(this.conversation, new ImageEventHandlerStrategy(imageEvent))
            }
      }


      protected readonly getIcon = getIcon;
}
