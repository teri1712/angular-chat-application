import {MessageState} from "./message-state";

export interface InboxLog {
      postingId: string,
      sequenceNumber: number
      chatId: string,
      roomName: string,
      roomAvatar: string,
      revisionNumber: number,
      senderId: string,
      action: LogAction,
      messageState: MessageState
}


export enum LogAction {
      ADDITION = "ADDITION",
      UPDATE = "UPDATE",
      DELETE = "DELETE",
}