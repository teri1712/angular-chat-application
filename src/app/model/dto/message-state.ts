import {User} from "./user";

export interface MessageState {
      readonly chatId: string,
      readonly postingId: string,
      readonly sender: User,
      readonly messageType: string,
      readonly seenBy: User[],
      readonly sequenceNumber: number,
      readonly createdAt: string,
      readonly updatedAt: string,
}

let seq = 0;

export const generateSequenceNumber = () => seq--;