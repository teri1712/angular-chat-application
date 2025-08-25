import {ListRepository} from "./repository";
import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../../environments";
import {map, Observable} from "rxjs";
import {ChatEvent} from "../../../model/chat-event";
import {ChatIdentifier} from "../../../model/chat-identifier";
import {AccountManager} from "../auth/account-manager";

export type EventQuery = {
      identifier: ChatIdentifier;
      atVersion?: number;
}

@Injectable()
export class EventRepository implements ListRepository<EventQuery, ChatEvent> {

      constructor(
              private readonly httpClient: HttpClient,
              private readonly accountManager: AccountManager) {
      }

      list(index: EventQuery): Observable<ChatEvent[]> {
            const atVersion = index.atVersion
            const identifier = index.identifier;
            const params = new HttpParams()
                    .set("atVersion", atVersion ?? this.accountManager.eventVersion);

            return this.httpClient.get<ChatEvent[]>(environment.API_URL + "/chats/" + encodeURIComponent(identifier.toString()) + "/events", {
                  observe: 'body',
                  params: params
            }).pipe(map((events) => {
                  return events.map((event) => {
                        return ChatEvent.from(event)
                  })
            }))
      }
}