import {Conversation} from "./conversation";
import {Message} from "./message";
import {Equality} from "../usecases/utils/array";
import {ChatIdentifier} from "./chat-identifier";
import {EventCache} from "../usecases/service/cache/domain/event-cache";

export abstract class Dialog implements Equality {

      constructor(
              public conversation: Conversation,
              public onlineAt: number = 0,
              public newest?: Message,
      ) {
      }

      abstract get messages(): Message[]

      get identifier(): ChatIdentifier {
            return this.conversation.identifier
      }

      equals(other: any): boolean {
            return other instanceof Dialog && other.identifier.equals(this.identifier);
      }
}

export class PersistenceDialog extends Dialog {
      constructor(
              private eventCache: EventCache,
              conversation: Conversation,
              onlineAt: number = 0,
              newest?: Message,
      ) {
            super(conversation, onlineAt, newest);
      }

      get messages(): Message[] {
            return this.conversation.toMessages(this.eventCache.get(this.conversation));
      }

}