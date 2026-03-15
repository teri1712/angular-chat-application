import {MessageState} from "./dto/message-state";

export enum SendState {
      Pending, Sending, Sent, Error, None
}

export interface ISendingMessage {

      readonly postingId: string
      readonly sendState: SendState
      readonly mockState: MessageState

}

export interface LeftMessage {
}

export interface RightMessage {
      sendState: SendState,
}

export interface ISentMessage {

      readonly sendState: SendState.Sent
      readonly sentState: MessageState
}

export interface IErrorMessage extends ISendingMessage {
      readonly reason: string
      readonly sendState: SendState.Error
}

// Long story
