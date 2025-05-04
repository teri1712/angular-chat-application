import {TextEvent} from "./text-event";
import {ImageEvent} from "./image-event";
import {IconEvent} from "./icon-event";
import {ChatEvent} from "./chat-event";

export enum Position {
      Top, Center, Bottom, Single
}

export abstract class Message {

      public id: string
      public sender: string
      public receiveTime: number
      public fixedDisplayTime: boolean = false
      public isLastSeen: boolean = false
      public seenAt: number = Number.MIN_SAFE_INTEGER
      public position: Position = Position.Single
      public eventVersion?: number
      public textEvent?: TextEvent
      public imageEvent?: ImageEvent
      public iconEvent?: IconEvent

      protected constructor(chatEvent: ChatEvent) {
            console.assert(chatEvent.isMessage())
            this.id = chatEvent.id
            this.sender = chatEvent.sender
            this.receiveTime = chatEvent.receiveTime
            this.textEvent = chatEvent.textEvent
            this.imageEvent = chatEvent.imageEvent
            this.iconEvent = chatEvent.iconEvent
            this.eventVersion = chatEvent.eventVersion
      }


      get seen(): boolean {
            return this.seenAt !== Number.MIN_SAFE_INTEGER
      }

}

export enum SendState {
      Sending, Sent
}

export class OwnerMessage extends Message {

      public sendState: SendState = SendState.Sending
      public isLastSent: boolean = false

      constructor(chatEvent: ChatEvent) {
            super(chatEvent);
      }
}

export class PartnerMessage extends Message {
      constructor(chatEvent: ChatEvent) {
            super(chatEvent);
      }
}
