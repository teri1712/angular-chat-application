import {ChatIdentifier} from "./chat-identifier";
import {Preference} from "./preference";

export class Chat {

      static from(raw: any): Chat {
            const id = ChatIdentifier.from(raw.identifier || {});
            const owner = raw.owner ?? "";
            const partner = raw.partner ?? "";
            const preference = raw.preference ? Preference.from(raw.preference) : undefined;
            return new Chat(id, owner, partner, preference);
      }

      constructor(
              public identifier: ChatIdentifier = new ChatIdentifier(),
              public owner: string = "",
              public partner: string = "",
              public preference: Preference | undefined = undefined
      ) {
      }
}
