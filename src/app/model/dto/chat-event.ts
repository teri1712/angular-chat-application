import {SeenEvent} from "./seen-event";
import {ImageEvent} from "./image-event";
import {IconEvent} from "./icon-event";
import {TextEvent} from "./text-event";
import {Chat} from "./chat";
import {User} from "./user";
import {PreferenceEvent} from "./preference-event";
import {FileEvent} from "./file-event";
import {Conversation} from "./conversation";
import {v4 as uuidv4} from 'uuid';

export const NONE: string = "NONE"
export const TEXT: string = "TEXT"
export const ICON: string = "ICON"
export const SEEN: string = "SEEN"
export const FILE: string = "FILE"
export const IMAGE: string = "IMAGE"
export const PREFERENCE: string = "PREFERENCE"

export class ChatEvent {

      constructor(
              readonly idempotencyKey: string = uuidv4(),
              readonly id: string | undefined = undefined,
              readonly sender: string = "",
              readonly owner: User = new User(),
              readonly partner: User = new User(),
              readonly textEvent?: TextEvent,
              readonly seenEvent?: SeenEvent,
              readonly imageEvent?: ImageEvent,
              readonly iconEvent?: IconEvent,
              readonly preferenceEvent?: PreferenceEvent,
              readonly fileEvent?: FileEvent,
              readonly eventVersion?: number,
              readonly createdTime: string = new Date().toISOString(),
              readonly message: boolean = true,
              readonly eventType: string = NONE,
              readonly chat: Chat = new Chat()
      ) {
      }

      static builder(): ChatEventBuilder {
            return new ChatEventBuilder();
      }

      static from(event: ChatEvent): ChatEventBuilder {
            return new ChatEventBuilder()
                    .idempotencyKey(event.idempotencyKey)
                    .id(event.id)
                    .sender(event.sender)
                    .owner(event.owner)
                    .partner(event.partner)
                    .textEvent(event.textEvent)
                    .seenEvent(event.seenEvent)
                    .imageEvent(event.imageEvent)
                    .iconEvent(event.iconEvent)
                    .preferenceEvent(event.preferenceEvent)
                    .fileEvent(event.fileEvent)
                    .eventVersion(event.eventVersion)
                    .createdTime(event.createdTime)
                    .message(event.message)
                    .eventType(event.eventType)
                    .chat(event.chat);
      }

}

export class ChatEventBuilder {
      private _idempotencyKey: string = uuidv4();
      private _id: string | undefined = undefined;
      private _sender: string = "";
      private _owner: User = new User();
      private _partner: User = new User();
      private _textEvent?: TextEvent;
      private _seenEvent?: SeenEvent;
      private _imageEvent?: ImageEvent;
      private _iconEvent?: IconEvent;
      private _preferenceEvent?: PreferenceEvent;
      private _fileEvent?: FileEvent;
      private _eventVersion?: number;
      private _createdTime: string = new Date().toISOString();
      private _message: boolean = true;
      private _eventType: string = NONE;
      private _chat: Chat = new Chat();

      idempotencyKey(value: string): ChatEventBuilder {
            this._idempotencyKey = value;
            return this;
      }

      id(value: string | undefined): ChatEventBuilder {
            this._id = value;
            return this;
      }

      sender(value: string): ChatEventBuilder {
            this._sender = value;
            return this;
      }

      owner(value: User): ChatEventBuilder {
            this._owner = value;
            return this;
      }

      partner(value: User): ChatEventBuilder {
            this._partner = value;
            return this;
      }

      textEvent(value: TextEvent | undefined): ChatEventBuilder {
            this._textEvent = value;
            return this;
      }

      seenEvent(value: SeenEvent | undefined): ChatEventBuilder {
            this._seenEvent = value;
            return this;
      }

      imageEvent(value: ImageEvent | undefined): ChatEventBuilder {
            this._imageEvent = value;
            return this;
      }

      iconEvent(value: IconEvent | undefined): ChatEventBuilder {
            this._iconEvent = value;
            return this;
      }

      preferenceEvent(value: PreferenceEvent | undefined): ChatEventBuilder {
            this._preferenceEvent = value;
            return this;
      }

      fileEvent(value: FileEvent | undefined): ChatEventBuilder {
            this._fileEvent = value;
            return this;
      }

      eventVersion(value: number | undefined): ChatEventBuilder {
            this._eventVersion = value;
            return this;
      }

      createdTime(value: string): ChatEventBuilder {
            this._createdTime = value;
            return this;
      }

      message(value: boolean): ChatEventBuilder {
            this._message = value;
            return this;
      }

      eventType(value: string): ChatEventBuilder {
            this._eventType = value;
            return this;
      }

      chat(value: Chat): ChatEventBuilder {
            this._chat = value;
            return this;
      }

      build(): ChatEvent {
            return new ChatEvent(
                    this._idempotencyKey,
                    this._id,
                    this._sender,
                    this._owner,
                    this._partner,
                    this._textEvent,
                    this._seenEvent,
                    this._imageEvent,
                    this._iconEvent,
                    this._preferenceEvent,
                    this._fileEvent,
                    this._eventVersion,
                    this._createdTime,
                    this._message,
                    this._eventType,
                    this._chat
            );
      }
}

export function getConversation(chatEvent: ChatEvent): Conversation {
      return new Conversation(chatEvent.chat, chatEvent.owner, chatEvent.partner)
}


export function isPendingEvent(event: ChatEvent): boolean {
      return !event.eventVersion;
}

export function isErrorEvent(event: ChatEvent): boolean {
      return event.eventVersion === -1;
}
