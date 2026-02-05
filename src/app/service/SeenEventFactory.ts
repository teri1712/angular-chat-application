import {Conversation} from "../model/dto/conversation";
import {SeenEvent} from "../model/dto/seen-event";
import {EventFactory} from "./eventFactory";
import {ChatEvent, SEEN} from "../model/dto/chat-event";
import {Injectable} from "@angular/core";

@Injectable({providedIn: 'root'})

export class SeenEventFactory implements EventFactory {

      create(conversation: Conversation, at: Date): ChatEvent {
            return ChatEvent.builder()
                    .chat(conversation.chat)
                    .sender(conversation.owner.id)
                    .owner(conversation.owner)
                    .partner(conversation.partner)
                    .eventType(SEEN)
                    .message(false)
                    .seenEvent(new SeenEvent(new Date(at).toISOString()))
                    .build();
      }


}