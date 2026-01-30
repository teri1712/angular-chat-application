import {Conversation} from "../model/dto/conversation";
import {v4 as uuidv4} from 'uuid';
import {SeenEvent} from "../model/dto/seen-event";
import {HttpClient} from "@angular/common/http";
import {environment} from "../environments";
import {EventHandlerStrategy} from "./event-handler.strategy";
import {ChatEvent} from "../model/dto/chat-event";
import {toIdString} from "../model/dto/chat-identifier";

export class SeenEventHandlerStrategy implements EventHandlerStrategy {
      public readonly idempotencyKey: string = uuidv4();
      private readonly seenEvent: SeenEvent;

      constructor(private conversation: Conversation, at: Date) {
            this.seenEvent = new SeenEvent(new Date(at).toISOString());
      }

      create(): ChatEvent {
            const event = new ChatEvent(this.idempotencyKey);
            event.chat = this.conversation.chat;
            event.sender = this.conversation.owner.id;
            event.owner = this.conversation.owner;
            event.partner = this.conversation.partner;
            event.eventType = 'SEEN';
            event.message = false;
            event.seenEvent = this.seenEvent;
            return event;
      }


      send(http: HttpClient, onSent: () => void, onConnectionLost: () => void): void {
            const chatIdentifier = this.conversation.chat.identifier;
            const url = environment.API_URL + '/chats/' + encodeURIComponent(toIdString(chatIdentifier)) + '/seen-events';
            http
                    .post(url, this.seenEvent, {
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
                                  }
                                  console.error(error);

                            }
                    );
      }
}