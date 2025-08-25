import {ListRepository, Repository} from "./repository";
import {ChatSnapshot} from "../../../model/chat-snapshot";
import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {ChatIdentifier} from "../../../model/chat-identifier";
import {environment} from "../../../environments";
import {map, Observable} from "rxjs";
import {AccountManager} from "../auth/account-manager";

@Injectable()
export class ChatRepository implements ListRepository<ChatIdentifier, ChatSnapshot>, Repository<ChatIdentifier, ChatSnapshot> {
      constructor(
              private readonly httpClient: HttpClient,
              private accountManager: AccountManager,) {
      }

      get(index: ChatIdentifier): Observable<ChatSnapshot> {
            return this.httpClient.get<ChatSnapshot>(environment.API_URL + "/chats/" + index.toString(), {
                  observe: 'body',
            }).pipe(map((snapshots: ChatSnapshot) => {
                  return ChatSnapshot.from(snapshots)
            }));
      }

      list(index?: ChatIdentifier): Observable<ChatSnapshot[]> {
            let params = new HttpParams();
            const eventVersion = this.accountManager.eventVersion
            params = params.set("atVersion", eventVersion);
            if (index) {
                  params = params.set("startAt", index.toString());
            }
            return this.httpClient.get<ChatSnapshot[]>(environment.API_URL + "/chats", {
                  observe: 'body',
                  params: params,
            }).pipe(map((snapshots: ChatSnapshot[]) => {
                  if (snapshots.length > 0 && !!index) {
                        snapshots.shift();
                  }
                  return snapshots.map((snapshot) => {
                        return ChatSnapshot.from(snapshot)
                  })
            }))
      }
}