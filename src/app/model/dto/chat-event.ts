import {SeenEvent} from "./seen-event";
import {ImageEvent} from "./image-event";
import {IconEvent} from "./icon-event";
import {TextEvent} from "./text-event";
import {Chat} from "./chat";
import {User} from "./user";
import {PreferenceEvent} from "./preference-event";
import {FileEvent} from "./file-event";
import {Conversation} from "./conversation";

export const NONE: string = "NONE"
export const TEXT: string = "TEXT"
export const ICON: string = "ICON"
export const SEEN: string = "SEEN"
export const FILE: string = "FILE"
export const PREFERENCE: string = "PREFERENCE"

export class ChatEvent {

      constructor(
              public idempotencyKey: string,
              public id: string | undefined = undefined,
              public sender: string = "",
              public owner: User = new User(),
              public partner: User = new User(),
              public textEvent?: TextEvent,
              public seenEvent?: SeenEvent,
              public imageEvent?: ImageEvent,
              public iconEvent?: IconEvent,
              public preferenceEvent?: PreferenceEvent,
              public fileEvent?: FileEvent,
              public eventVersion?: number,
              public createdTime: string = new Date().toISOString(),
              public message: boolean = true,
              public eventType: string = NONE,
              public chat: Chat = new Chat()
      ) {
      }

}

export function getConversation(chatEvent: ChatEvent): Conversation {
      return new Conversation(chatEvent.chat, chatEvent.owner, chatEvent.partner)
}


export function isPendingEvent(event: ChatEvent): boolean {
      return !event.eventVersion;
}
