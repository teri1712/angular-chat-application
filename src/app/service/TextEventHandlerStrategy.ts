import {EventHandlerStrategy} from "./event-handler.strategy";
import {ChatEvent, TEXT} from "../model/dto/chat-event";
import {HttpClient} from "@angular/common/http";
import {TextEvent} from "../model/dto/text-event";
import {environment} from "../environments";
import {Conversation} from "../model/dto/conversation";
import {v4 as uuidv4} from 'uuid';
import {toIdString} from "../model/dto/chat-identifier";

export class TextEventHandlerStrategy implements EventHandlerStrategy {
      public readonly idempotencyKey: string = uuidv4();
      private readonly textEvent: TextEvent;

      constructor(private conversation: Conversation, private readonly textContent: string) {
            this.textEvent = new TextEvent(textContent);
      }

      send(http: HttpClient, onSent: () => void, onError: () => void, onConnectionLost: () => void): void {
            const chatIdentifier = this.conversation.chat.identifier;
            const url = environment.API_URL + '/chats/' + encodeURIComponent(toIdString(chatIdentifier)) + '/text-events';
            http
                    .post(url, this.textEvent, {
                          headers: {
                                'Content-Type': 'application/json',
                                'Idempotency-key': this.idempotencyKey
                          },
                    }).subscribe(
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
                    .textEvent(this.textEvent)
                    .eventType(TEXT)
                    .build();
      }
}
