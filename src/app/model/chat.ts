import {ChatIdentifier} from "./chat-identifier";

export class Chat {

      static from(raw: any): Chat {
            const id = ChatIdentifier.from(raw.identifier || {});
            const owner = raw.owner ?? "";
            const partner = raw.partner ?? "";
            return new Chat(id, owner, partner);
      }

      constructor(
              public identifier: ChatIdentifier = new ChatIdentifier(),
              public owner: string = "",
              public partner: string = "") {
      }

}