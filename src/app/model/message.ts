import {MessageState} from "./dto/message-state";

export enum SendState {
    Pending, Sending, Sent, Error, Received
}

export interface ISendingMessage {

    readonly postingId: string
    readonly sendState: SendState
    readonly mockState: MessageState

}


export interface IErrorMessage extends ISendingMessage {
    readonly reason: string
    readonly sendState: SendState.Error
}

// Long story
