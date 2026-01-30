import {EventHandlerStrategy} from "./event-handler.strategy";
import {ChatEvent, IMAGE} from "../model/dto/chat-event";
import {ImageEvent} from "../model/dto/image-event";
import {environment} from "../environments";
import {HttpClient} from "@angular/common/http";
import {Conversation} from "../model/dto/conversation";
import {v4 as uuidv4} from 'uuid';
import {toIdString} from "../model/dto/chat-identifier";
import {UploadService} from "./upload-service";
import {switchMap} from "rxjs";

export class ImageEventHandlerStrategy implements EventHandlerStrategy {

      public readonly idempotencyKey: string = uuidv4();
      private readonly imageEvent: ImageEvent;

      constructor(
              private readonly uploadService: UploadService,
              private conversation: Conversation,
              private readonly image: File,
              width: number = 200,
              height: number = 200,
              format: string = 'jpg'
      ) {
            this.imageEvent = new ImageEvent(URL.createObjectURL(this.image), this.image.name, width, height, format);
      }


      send(http: HttpClient, onSent: () => void, onError: () => void, onConnectionLost: () => void): void {
            const url = environment.API_URL + '/chats/' + encodeURIComponent(toIdString(this.conversation.chat.identifier)) + '/image-events';
            const sendEvent = (downloadUrl: string) => {
                  this.imageEvent.downloadUrl = downloadUrl;
                  return http
                          .post(url, this.imageEvent, {
                                headers: {
                                      'Content-Type': 'application/json',
                                      'Idempotency-key': this.idempotencyKey
                                },
                          })
            };

            const filename = this.image.name;
            this.uploadService.upload(filename, this.image).pipe(
                    switchMap((downloadUrl) => sendEvent(downloadUrl.path)))
                    .subscribe(
                            () => {
                                  onSent();
                            },
                            (error) => {
                                  if (error.status === 0) {
                                        onConnectionLost();
                                  } else {
                                        onError();
                                  }
                                  console.error(error);
                            }
                    )
      }

      create(): ChatEvent {
            return ChatEvent.builder()
                    .idempotencyKey(this.idempotencyKey)
                    .chat(this.conversation.chat)
                    .sender(this.conversation.owner.id)
                    .owner(this.conversation.owner)
                    .partner(this.conversation.partner)
                    .eventType(IMAGE)
                    .imageEvent(this.imageEvent)
                    .build();
      }
}
