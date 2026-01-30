import {ChatIdentifier} from "./chat-identifier";

export class TypeEvent {
      constructor(
              public chat: ChatIdentifier = new ChatIdentifier(),
              public from: string = "",
              public time: string = new Date(0).toISOString()) {
      }

}