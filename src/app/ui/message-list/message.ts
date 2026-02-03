import {ChatEvent, isErrorEvent} from "../../model/dto/chat-event";
import {IErrorMessage, IMessage, IMyMessage, IYourMessage, Position, SendState} from "../../model/IMessage";
import {FileEvent} from "../../model/dto/file-event";
import {IconEvent} from "../../model/dto/icon-event";
import {ImageEvent} from "../../model/dto/image-event";
import {TextEvent} from "../../model/dto/text-event";

export abstract class Message implements IMessage {

      public id: string | undefined
      public idempotencyKey: string
      public sender: string
      public receiveTime: Date = new Date()
      public fixedDisplayTime: boolean = false
      public isLastSeen: boolean = false
      public seenAt?: Date
      public position: Position = Position.Single
      public eventVersion?: number
      public textEvent?: TextEvent
      public imageEvent?: ImageEvent
      public iconEvent?: IconEvent
      public fileEvent?: FileEvent
      public messageType: string

      protected constructor(chatEvent: ChatEvent) {
            this.id = chatEvent.id
            this.idempotencyKey = chatEvent.idempotencyKey
            this.sender = chatEvent.sender
            this.textEvent = chatEvent.textEvent
            this.imageEvent = chatEvent.imageEvent
            this.iconEvent = chatEvent.iconEvent
            this.fileEvent = chatEvent.fileEvent
            this.eventVersion = chatEvent.eventVersion
            this.receiveTime = new Date(chatEvent.createdTime);
            this.messageType = chatEvent.eventType;
      }


}


export class MyMessage extends Message implements IMyMessage {
      public sendState: SendState = SendState.Sending

      public isLastSent: boolean = false

      constructor(chatEvent: ChatEvent) {
            super(chatEvent);
      }
}

export class YourMessage extends Message implements IYourMessage {
      constructor(chatEvent: ChatEvent) {
            super(chatEvent);
      }
}

export class ErrorMessage extends MyMessage implements IErrorMessage {
      constructor(chatEvent: ChatEvent, public readonly reason: string) {
            super(chatEvent);
      }
}

export function toMessage(event: ChatEvent): IMessage {
      const mine = event.sender === event.owner.id;
      if (mine) {
            if (isErrorEvent(event))
                  return new ErrorMessage(event, "Error occurred while sending message.")
            else
                  return new MyMessage(event);
      } else {
            return new YourMessage(event)
      }
}

export function toMessages(events: ChatEvent[]): IMessage[] {
      return events.filter(event => event.message).map((event) => toMessage(event))
}