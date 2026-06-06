import {MessageState} from "./message-state";
import {User} from "./user";

export interface InboxLog {
    postingId: string,
    sequenceNumber: number
    chatId: string,
    roomName: string,
    roomAvatar: string,
    revisionNumber: number,
    sender: User,
    action: LogAction,
    messageState: MessageState
}


export enum LogAction {
    ADDITION = "ADDITION",
    UPDATE = "UPDATE",
    DELETE = "DELETE",
}