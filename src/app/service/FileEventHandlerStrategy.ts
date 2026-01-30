import {EventHandlerStrategy} from "./event-handler.strategy";
import {FileEvent} from "../model/dto/file-event";
import {ChatEvent} from "../model/dto/chat-event";
import {HttpClient} from "@angular/common/http";
import {environment} from "../environments";
import {Conversation} from "../model/dto/conversation";
import {v4 as uuidv4} from 'uuid';
import {toIdString} from "../model/dto/chat-identifier";
import {switchMap} from "rxjs";
import {UploadService} from "./upload-service";


export class FileEventHandlerStrategy implements EventHandlerStrategy {
      private readonly fileEvent: FileEvent;
      public readonly idempotencyKey: string = uuidv4();

      constructor(private readonly uploadService: UploadService, private conversation: Conversation, private readonly file: File) {
            this.fileEvent = new FileEvent(URL.createObjectURL(this.file), this.file.name, this.file.size);
      }

      send(http: HttpClient, onSent: () => void, onConnectionLost: () => void): void {
            const chatIdentifier = this.conversation.chat.identifier;

            const url = environment.API_URL + '/chats/' + encodeURIComponent(toIdString(chatIdentifier)) + '/file-events';
            const sendEvent = (downloadUrl: string) => {
                  this.fileEvent.mediaUrl = downloadUrl;

                  return http
                          .post(url, this.fileEvent, {
                                headers: {
                                      'Content-Type': 'application/json',
                                      'Idempotency-key': this.idempotencyKey
                                },
                          })
            };


            const filename = this.file.name;
            this.uploadService.upload(filename, this.file).pipe(
                    switchMap((downloadUrl) => sendEvent(downloadUrl.path)))
                    .subscribe(
                            () => {
                                  onSent();
                            },
                            (error) => {
                                  if (error.status === 0) {
                                        onConnectionLost();
                                  }
                                  console.error(error);

                            }
                    )
      }

      create(): ChatEvent {
            const event = new ChatEvent(this.idempotencyKey);
            event.chat = this.conversation.chat;
            event.sender = this.conversation.owner.id;
            event.owner = this.conversation.owner;
            event.partner = this.conversation.partner;
            event.eventType = 'FILE'
            event.fileEvent = this.fileEvent;
            return event;
      }
}