import {EventFactory} from "./eventFactory";
import {FileEvent} from "../model/dto/file-event";
import {ChatEvent, FILE} from "../model/dto/chat-event";
import {Conversation} from "../model/dto/conversation";
import {Injectable} from "@angular/core";

@Injectable({providedIn: 'root'})

export class FileEventFactory implements EventFactory {
      create(conversation: Conversation, file: File): ChatEvent {
            const fileEvent = new FileEvent(URL.createObjectURL(file), file.name, file.size);
            fileEvent.file = file;
            return ChatEvent.builder()
                    .chat(conversation.chat)
                    .sender(conversation.owner.id)
                    .owner(conversation.owner)
                    .partner(conversation.partner)
                    .eventType(FILE)
                    .fileEvent(fileEvent)
                    .build();
      }
}