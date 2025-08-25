import {GetRepository, ListRepository} from "./repository";
import {Online} from "../../../model/Online";
import {map, Observable} from "rxjs";
import {environment} from "../../../environments";
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {AccountManager} from "../auth/account-manager";
import {User} from "../../../model/user";
import {Conversation} from "../../../model/conversation";

@Injectable()
export class OnlineRepository implements GetRepository<string, Online>, ListRepository<string, Online> {

      private readonly user: User;

      constructor(private readonly httpClient: HttpClient, accountManager: AccountManager) {
            this.user = accountManager.user;
      }

      list(): Observable<Online[]> {
            return this.httpClient.get<Online[]>(environment.API_URL + "/presences", {
                  observe: 'body',
            }).pipe(map((res: Online[]) => {
                  return res.map((online: Online) => {
                        online.conversation = Conversation.fromPartner(this.user, online.user)
                        return online;
                  });
            }))
      }

      get(username: string): Observable<Online> {
            return this.httpClient.get<Online>(environment.API_URL + "/presences/" + encodeURIComponent(username), {
                  observe: 'body',
            }).pipe(map((online: Online) => {
                  online.conversation = Conversation.fromPartner(this.user, online.user)
                  return online;
            }));
      }
}