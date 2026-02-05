import {EventFactory} from "./eventFactory";
import {ChatEvent, TEXT} from "../model/dto/chat-event";
import {TextEvent} from "../model/dto/text-event";
import {Conversation} from "../model/dto/conversation";
import {Injectable} from "@angular/core";

@Injectable({providedIn: 'root'})
export class TextEventFactory implements EventFactory {
      create(conversation: Conversation, textContent: string): ChatEvent {
            return ChatEvent.builder()
                    .chat(conversation.chat)
                    .sender(conversation.owner.id)
                    .owner(conversation.owner)
                    .partner(conversation.partner)
                    .textEvent(new TextEvent(textContent))
                    .eventType(TEXT)
                    .build();
      }
}
