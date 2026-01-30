import {GetRepository, ListRepository} from "./repository";
import {ChatSnapshot} from "../../model/dto/chat-snapshot";
import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {ChatIdentifier, toIdString} from "../../model/dto/chat-identifier";
import {environment} from "../../environments";
import {map, Observable, of, switchMap} from "rxjs";
import {RealtimeClient} from "../websocket/realtime-client.service";
import EventCache from "../cache/data/event-cache";
import {ChatDetails} from "../../model/dto/chat-details";

@Injectable()
export class ChatRepository implements ListRepository<ChatIdentifier, ChatSnapshot>, GetRepository<ChatIdentifier, ChatDetails> {
      constructor(
              private readonly httpClient: HttpClient,
              private readonly eventCache: EventCache,
              private readonly realtimeClient: RealtimeClient) {
      }

      get(index: ChatIdentifier): Observable<ChatDetails> {
            return this.httpClient.get<ChatDetails>(environment.API_URL + "/chats/" + toIdString(index), {
                  observe: 'body',
            }).pipe(map((details: ChatDetails) => {
                  return details
            }));
      }

      list(index?: ChatIdentifier): Observable<ChatSnapshot[]> {
            let params = new HttpParams();
            params = params.set("atVersion", this.realtimeClient.syncVersion);
            if (index) {
                  params = params.set("startAt", toIdString(index));
            }
            return this.httpClient.get<ChatSnapshot[]>(environment.API_URL + "/chats", {
                  observe: 'body',
                  params: params,
            }).pipe(switchMap((snapshots: ChatSnapshot[]) => {
                  if (snapshots.length != 0 && snapshots[0].atVersion != this.realtimeClient.syncVersion)
                        throw Error("Please retry");
                  snapshots.forEach((snapshot) => {
                        snapshot.eventList.forEach((event) => this.eventCache.put(event))
                  })
                  return of(snapshots);
            }))
      }
}