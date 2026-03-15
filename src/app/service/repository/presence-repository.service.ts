import {BuddyPresence} from "../../model/dto/buddyPresence";
import {Observable} from "rxjs";
import {environment} from "../../environments";
import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {ChatPresence} from "../../model/dto/chat-presence";

@Injectable()
export class PresenceRepository {

      constructor(private readonly httpClient: HttpClient) {
      }

      list(): Observable<BuddyPresence[]> {
            return this.httpClient.get<BuddyPresence[]>(environment.API_URL + "/buddy-presences", {
                  observe: 'body',
            });
      }

      find(chatIds: string[]): Observable<PresenceMap> {
            let params = new HttpParams();
            chatIds.forEach(chatId => {
                  params = params.append('chatId', chatId);
            });
            return this.httpClient.get<PresenceMap>(environment.API_URL + "/presences", {
                  params: params,
                  observe: 'body'
            });
      }
}

export type PresenceMap = {
      [key: string]: ChatPresence;
};