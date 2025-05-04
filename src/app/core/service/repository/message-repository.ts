import {ListRepository} from "./repository";
import {Message} from "../../../model/message";
import {map, Observable} from "rxjs";
import {EventRepository} from "./event-repository";
import {Conversation} from "../../../model/conversation";
import {Injectable} from "@angular/core";
import {ChatEvent} from "../../../model/chat-event";
import {EventCache} from "../cache/domain/event-cache";
import {binary_search} from "../../utils/array";


export type MessageQuery = {
      conversation: Conversation;
      startAt?: Message;
}

@Injectable()
export class MessageRepository implements ListRepository<MessageQuery, Message> {

      constructor(
              private readonly eventCache: EventCache,
              private readonly eventRepository: EventRepository) {
      }

      private listFromCache(conversation: Conversation, time: number): Message[] {
            const events = this.eventCache.get(conversation)
            const index = binary_search(events, {
                  order: time - 1
            })
            if (index == events.length)
                  return [];
            return conversation.toMessages(events.slice(index))
      }

      list(query: MessageQuery): Observable<Message[]> | Message[] {
            const conversation = query.conversation;
            const startAt = query.startAt;

            const time = startAt?.receiveTime ?? Number.MAX_VALUE;
            const cacheList = this.listFromCache(conversation, time);
            if (cacheList.length != 0)
                  return cacheList;
            const atVersion = startAt?.eventVersion
            return this.eventRepository.list({
                  identifier: conversation.identifier,
                  atVersion: atVersion
            }).pipe(map((events: ChatEvent[]) => {
                  events = events.length == 0 ? events : events.slice(1);

                  this.eventCache.save(conversation, events);
                  if (!!startAt)
                        return conversation.toMessages(events)

                  return this.listFromCache(conversation, time)
            }))
      }
}