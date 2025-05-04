import {User} from "./user";
import {Chat} from "./chat";
import {ChatIdentifier} from "./chat-identifier";
import {ChatEvent} from "./chat-event";
import {Message, OwnerMessage, PartnerMessage, SendState} from "./message";
import {SeenEvent} from "./seen-event";

export class Conversation {
      static from(raw: any): Conversation {
            const chat = Chat.from(raw.chat || {});
            const owner = User.from(raw.owner || {});
            const partner = User.from(raw.partner || {});
            return new Conversation(chat, owner, partner);
      }

      constructor(
              public chat: Chat = new Chat(),
              public owner: User = new User(),
              public partner: User = new User()) {
      }

      get identifier(): ChatIdentifier {
            return this.chat.identifier
      }


      toMessage(event: ChatEvent): Message {
            return event.sender === this.owner.id
                    ? new OwnerMessage(event)
                    : new PartnerMessage(event);
      }

      toMessages(events: ChatEvent[]): Message[] {
            const messages: Message[] = [];
            let partnerSeen: SeenEvent | null = null;
            let ownerSeen: SeenEvent | null = null;
            let lastSent: OwnerMessage | null = null;

            for (const event of events) {
                  const ofOwner = event.sender === this.owner.id;
                  if (event.seenEvent) {
                        if (!ofOwner) {
                              partnerSeen = event.seenEvent;
                        } else {
                              ownerSeen = event.seenEvent;
                        }
                  } else {
                        let message: Message;
                        if (ofOwner) {
                              message = new OwnerMessage(event);
                              if (partnerSeen) {
                                    message.seenAt = partnerSeen.at;
                              }
                              if (event.committed)
                                    (message as OwnerMessage).sendState = SendState.Sent
                              if (event.eventVersion && lastSent === null) {
                                    lastSent = message as OwnerMessage;
                                    (message as OwnerMessage).isLastSent = true;
                              }
                        } else {
                              message = new PartnerMessage(event);
                              if (ownerSeen) {
                                    message.seenAt = ownerSeen.at;
                              }
                        }
                        messages.push(message);
                  }
            }
            return messages;
      }

      isOfOwner(message: Message): message is OwnerMessage {
            return message.sender === this.owner.id
      }

}