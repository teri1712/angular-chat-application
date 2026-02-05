import {EventFactory} from "./eventFactory";
import {ChatEvent, IMAGE} from "../model/dto/chat-event";
import {ImageEvent} from "../model/dto/image-event";
import {Conversation} from "../model/dto/conversation";
import {Injectable} from "@angular/core";

@Injectable({providedIn: 'root'})

export class ImageEventFactory implements EventFactory {


      create(conversation: Conversation, imageDetails: {
            readonly image: File,
            width: number,
            height: number,
            format: string

      }): ChatEvent {
            const imageEvent = new ImageEvent(
                    URL.createObjectURL(imageDetails.image),
                    imageDetails.image.name,
                    imageDetails.width,
                    imageDetails.height,
                    imageDetails.format);
            imageEvent.file = imageDetails.image;
            return ChatEvent.builder()
                    .chat(conversation.chat)
                    .sender(conversation.owner.id)
                    .owner(conversation.owner)
                    .partner(conversation.partner)
                    .eventType(IMAGE)
                    .imageEvent(imageEvent)
                    .build();
      }
}
