import {ChatIdentifier} from "./chat-identifier";

export class TypeEvent {
      constructor(
              public chat: ChatIdentifier = new ChatIdentifier(),
              public from: string = "",
              public time: number = 0) {
      }

      static from(event: any): TypeEvent {
            const chat = ChatIdentifier.from(event.chat);
            return new TypeEvent(chat, event.from, event.time);
      }
}