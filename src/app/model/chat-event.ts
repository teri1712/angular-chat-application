import {ChatIdentifier} from "./chat-identifier";
import {SeenEvent} from "./seen-event";
import {ImageEvent} from "./image-event";
import {IconEvent} from "./icon-event";
import {TextEvent} from "./text-event";
import {Chat} from "./chat";
import {Conversation} from "./conversation";
import {User} from "./user";
import {Orderable} from "../core/utils/array";
import {v4 as uuidv4} from 'uuid';

export const NONE: string = "NONE"
export const TEXT: string = "TEXT"
export const IMAGE: string = "IMAGE"
export const ICON: string = "ICON"
export const SEEN: string = "SEEN"

export class ChatEvent implements Orderable {
      [key: string]: any;

      static from(raw: any): ChatEvent {
            const id = raw.id ?? "";
            const chatIdentifier = raw.chatIdentifier
                    ? ChatIdentifier.from(raw.chatIdentifier)
                    : new ChatIdentifier();
            const sender = raw.sender ?? "";
            const createdTime = typeof raw.createdTime === 'number' ? raw.createdTime : Date.now();
            const textEvent = raw.textEvent ? TextEvent.from(raw.textEvent) : undefined;
            const seenEvent = raw.seenEvent ? SeenEvent.from(raw.seenEvent) : undefined;
            const imageEvent = raw.imageEvent ? ImageEvent.from(raw.imageEvent) : undefined;
            const iconEvent = raw.iconEvent ? IconEvent.from(raw.iconEvent) : undefined;
            const eventVersion = typeof raw.eventVersion === 'number' ? raw.eventVersion : undefined;
            const eventType = raw.eventType ?? NONE;
            const chatEvent = new ChatEvent(
                    id,
                    chatIdentifier,
                    sender,
                    createdTime,
                    textEvent,
                    seenEvent,
                    imageEvent,
                    iconEvent,
                    eventVersion,
                    eventType
            );
            chatEvent.chat = Chat.from(raw.chat)
            chatEvent.owner = User.from(raw.owner)
            chatEvent.partner = User.from(raw.partner)
            return chatEvent
      }

      constructor(
              public id: string = uuidv4(),
              public chatIdentifier: ChatIdentifier = new ChatIdentifier(),
              public sender: string = "",
              public createdTime: number = Date.now(),
              public textEvent?: TextEvent,
              public seenEvent?: SeenEvent,
              public imageEvent?: ImageEvent,
              public iconEvent?: IconEvent,
              public eventVersion?: number,
              public eventType: string = NONE
      ) {
            this.receiveTime = this.createdTime
      }


      get order(): number {
            return -this.receiveTime
      }

      public receiveTime: number
      public chat: Chat = new Chat();
      public partner: User = new User();
      public owner: User = new User();

      set conversation(conversation: Conversation) {
            this.chat = conversation.chat;
            this.partner = conversation.partner
            this.owner = conversation.owner
      }

      get conversation(): Conversation {
            return new Conversation(this.chat, this.owner, this.partner);
      }

      get committed(): boolean {
            return this.eventVersion !== undefined
      }

      isMessage(): boolean {
            return !!this.textEvent || !!this.imageEvent || !!this.iconEvent;
      }
}