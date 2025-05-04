import {ChatEvent} from './chat-event';
import {ChatIdentifier} from './chat-identifier';
import {Conversation} from './conversation';

export class ChatSnapshot {

      constructor(
              public readonly conversation: Conversation = new Conversation(),
              public readonly eventList: ChatEvent[] = []) {
      }

      get identifier(): ChatIdentifier {
            return this.conversation.chat.identifier;
      }

      private findCommittedPosition(): number {
            const index = this.eventList.findIndex((event) => event.committed);
            return index === -1 ? this.eventList.length : index;
      }

      addFirst(event: ChatEvent): void {
            if (!event.committed) {
                  this.eventList.unshift(event);
                  return;
            }
            const committedPos = this.findCommittedPosition();
            for (let i = 0; i < committedPos; ++i) {
                  const existing = this.eventList[i];
                  if (existing.id === event.id) {
                        this.eventList[i] = event
                        return;
                  }
            }
            this.eventList.splice(committedPos, 0, event);
      }

      addAll(list: ChatEvent[]): void {
            list.forEach(chatEvent => {
                  this.add(chatEvent);
            });
      }

      add(chatEvent: ChatEvent): void {
            const length = this.eventList.length;
            if (length === 0) {
                  this.eventList.push(chatEvent);
                  return;
            }
            if (!chatEvent.committed) {
                  console.log(chatEvent);
                  throw new Error('Chat event must be committed');
            }
            const eventVersion = chatEvent.eventVersion!;
            const last = this.eventList[length - 1]
            if (last.committed) {
                  const lastVersion = last.eventVersion!
                  if (lastVersion <= eventVersion) {
                        return;
                  }
            }
            this.eventList.push(chatEvent);
      }

      rollBack(time: number): void {
            while (this.eventList.length > 0) {
                  const timeFirst = this.eventList[0]?.receiveTime;
                  if (timeFirst !== undefined && timeFirst <= time) {
                        break;
                  }
                  this.eventList.shift();
            }
      }

      static from(raw: any): ChatSnapshot {
            const conv = Conversation.from(raw.conversation || {});
            const events = Array.isArray(raw.eventList)
                    ? raw.eventList.map((e: any) => ChatEvent.from(e))
                    : [];
            return new ChatSnapshot(conv, events);
      }
}
