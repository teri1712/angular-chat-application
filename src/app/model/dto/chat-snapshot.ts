import {ChatEvent} from './chat-event';
import {Conversation} from './conversation';

export class ChatSnapshot {

      constructor(
              public readonly atVersion: number = 0,
              public readonly conversation: Conversation = new Conversation(),
              public readonly eventList: ChatEvent[] = []) {
      }
}
