import {Conversation} from "../model/dto/conversation";
import {EventFactory} from "./eventFactory";
import {IconEvent} from "../model/dto/icon-event";
import {ChatEvent, ICON} from "../model/dto/chat-event";
import {Injectable} from "@angular/core";

@Injectable({providedIn: 'root'})

export class IconEventFactory implements EventFactory {
      create(conversation: Conversation, iconId: number): ChatEvent {
            return ChatEvent.builder()
                    .chat(conversation.chat)
                    .sender(conversation.owner.id)
                    .owner(conversation.owner)
                    .partner(conversation.partner)
                    .eventType(ICON)
                    .iconEvent(new IconEvent(iconId))
                    .build();
      }
}
