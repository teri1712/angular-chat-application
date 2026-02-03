import {TextEvent} from "./dto/text-event";
import {ImageEvent} from "./dto/image-event";
import {IconEvent} from "./dto/icon-event";
import {FileEvent} from "./dto/file-event";

export enum Position {
      Top, Center, Bottom, Single
}

export enum SendState {
      Sending, Sent
}

export interface IMessage {

      readonly id: string | undefined;
      readonly idempotencyKey: string;
      readonly sender: string;
      readonly receiveTime: Date;
      readonly fixedDisplayTime: boolean;
      readonly isLastSeen: boolean;
      readonly seenAt?: Date;
      readonly position: Position;
      readonly eventVersion?: number;
      readonly textEvent?: TextEvent;
      readonly imageEvent?: ImageEvent;
      readonly iconEvent?: IconEvent;
      readonly fileEvent?: FileEvent;
      readonly messageType: string;

}


export interface IMyMessage extends IMessage {

      readonly sendState: SendState
      readonly isLastSent: boolean

}

export interface IErrorMessage extends IMyMessage {
      readonly reason: string
}

export interface IYourMessage extends IMessage {
}

// Long story
