import {Conversation} from "../../../model/dto/conversation";
import {ChatEvent} from "../../../model/dto/chat-event";

export class ConversationCache {

      constructor(
              public readonly conversation: Conversation = new Conversation(),
              private readonly eventList: ChatEvent[] = []) {
      }

      addFirst(event: ChatEvent): void {
            if (this.eventList.length != 0 && this.eventList[0].eventVersion! >= event.eventVersion!)
                  return
            this.eventList.unshift(event);
      }

      addAll(list: ChatEvent[]): void {
            list.forEach(chatEvent => {
                  this.add(chatEvent);
            });
      }

      add(event: ChatEvent): void {
            const length = this.eventList.length;
            if (length != 0 && this.eventList[length - 1].eventVersion! <= event.eventVersion!)
                  return
            this.eventList.push(event);
      }

      list(atVersion: number): ChatEvent[] {
            if (this.eventList.length == 0) {
                  return [];
            }
            if (this.eventList[0].eventVersion! > atVersion) {
                  let l = 0, r = this.eventList.length;
                  while (l < r) {
                        const m = Math.floor((l + r) / 2);
                        if (this.eventList[m].eventVersion! > atVersion) {
                              l = m + 1;
                        } else {
                              r = m;
                        }
                  }
                  return this.eventList.slice(l, l + 20);
            }
            return this.eventList.slice(0, 20);
      }
}