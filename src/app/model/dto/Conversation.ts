import {MessageState} from "./message-state";

export interface Conversation {
      readonly identifier: string;
      readonly roomName: string;
      readonly roomAvatar: string;
      readonly revisionNumber: number;
      readonly recents: MessageState[];
      readonly modifiedAt: Date
}
