import {ChatIdentifier} from "./chat-identifier";

export class Chat {

      constructor(
              public identifier: ChatIdentifier = new ChatIdentifier(),
              public owner: string = "",
              public partner: string = "",
      ) {
      }
}