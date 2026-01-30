import {Conversation} from "../model/dto/conversation";
import {v4 as uuidv4} from 'uuid';
import {EventHandlerStrategy} from "./event-handler.strategy";
import {IconEvent} from "../model/dto/icon-event";
import {HttpClient} from "@angular/common/http";
import {environment} from "../environments";
import {ChatEvent, ICON} from "../model/dto/chat-event";
import {toIdString} from "../model/dto/chat-identifier";

export class IconEventHandlerStrategy implements EventHandlerStrategy {
      public readonly idempotencyKey: string = uuidv4();
      private readonly iconEvent: IconEvent;

      constructor(private conversation: Conversation, private readonly iconId: number) {
            this.iconEvent = new IconEvent(iconId);
      }


      send(http: HttpClient, onSent: () => void, onError: () => void, onConnectionLost: () => void): void {
            const chatIdentifier = this.conversation.chat.identifier;
            const url = environment.API_URL + '/chats/' + encodeURIComponent(toIdString(chatIdentifier)) + '/icon-events';
            http
                    .post(url, this.iconEvent, {
                          headers: {
                                'Content-Type': 'application/json',
                                'Idempotency-key': this.idempotencyKey
                          },
                    })
                    .subscribe(
                            (res) => {
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
                    );
      }

      create(): ChatEvent {
            return ChatEvent.builder()
                    .idempotencyKey(this.idempotencyKey)
                    .chat(this.conversation.chat)
                    .sender(this.conversation.owner.id)
                    .owner(this.conversation.owner)
                    .partner(this.conversation.partner)
                    .eventType(ICON)
                    .iconEvent(this.iconEvent)
                    .build();
      }
}
