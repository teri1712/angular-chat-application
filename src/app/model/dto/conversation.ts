import {User} from "./user";
import {Chat} from "./chat";
import {ChatIdentifier} from "./chat-identifier";

export class Conversation {

      static fromPartner(owner: User, partner: User): Conversation {
            const chat = new Chat(new ChatIdentifier(owner.id, partner.id), owner.id, partner.id);
            return new Conversation(
                    chat,
                    owner,
                    partner
            )
      }

      constructor(
              public chat: Chat = new Chat(),
              public owner: User = new User(),
              public partner: User = new User()) {
      }

}

