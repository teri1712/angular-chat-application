import {ListRepository} from "./repository";
import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../environments";
import {map, Observable, of} from "rxjs";
import {ChatEvent} from "../../model/dto/chat-event";
import {Conversation} from "../../model/dto/conversation";
import EventCache from "../cache/data/event-cache";
import {toIdString} from "../../model/dto/chat-identifier";
import {RealtimeClient} from "../websocket/realtime-client.service";

export type EventQuery = {
      conversation: Conversation;
      atVersion?: number;
}

@Injectable()
export class EventRepository implements ListRepository<EventQuery, ChatEvent> {


      constructor(
              private eventCache: EventCache,
              private readonly realtimeClient: RealtimeClient,
              private readonly httpClient: HttpClient) {
      }


      list(query: EventQuery): Observable<ChatEvent[]> {
            const atVersion = query.atVersion ?? this.realtimeClient.syncVersion;
            const conversation = query.conversation;
            const identifier = conversation.chat.identifier;
            const params = new HttpParams()
                    .set("atVersion", atVersion);

            const eventList = this.eventCache.list(conversation, atVersion);
            if (eventList.length >= 20)
                  return of(eventList)

            return this.httpClient.get<ChatEvent[]>(environment.API_URL + "/chats/" + encodeURIComponent(toIdString(identifier)) + "/events", {
                  observe: 'body',
                  params: params
            }).pipe(map((events) => {
                  events.forEach((event) => this.eventCache.put(event))
                  return this.eventCache.list(query.conversation, atVersion)
            }))
      }
}