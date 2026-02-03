import {ChatIdentifier} from "./chat-identifier";

export interface MessageHistory {
      id: string,
      chatIdentifier: ChatIdentifier,
      partnerName: string,
      content: string;
}