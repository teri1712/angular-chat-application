import {GetRepository, ListRepository} from "./repository";
import {Online} from "../../model/dto/online";
import {map, Observable, of} from "rxjs";
import {environment} from "../../environments";
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";

@Injectable()
export class OnlineRepository implements GetRepository<string, Online>, ListRepository<string, Online> {

      private onlineMap = new Map<string, Online>();

      constructor(private readonly httpClient: HttpClient) {
      }

      list(): Observable<Online[]> {
            return this.httpClient.get<any[]>(environment.API_URL + "/presences", {
                  observe: 'body',
            }).pipe(map((res: any[]) => {
                  return res.map((online: Online) => {
                        this.onlineMap.set(online.username, online);
                        return online;
                  });
            }))
      }

      get(username: string): Observable<Online> {
            const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
            const online = this.onlineMap.get(username);
            if (online) {
                  const onlineAt = new Date(online.at);
                  if (onlineAt > twoMinutesAgo)
                        return of(online);
                  else
                        this.onlineMap.delete(username);
            }
            return this.httpClient.get<any>(environment.API_URL + "/presences/" + encodeURIComponent(username), {
                  observe: 'body',
            }).pipe(map((online: Online) => {
                  this.onlineMap.set(online.username, online);
                  return online;
            }));
      }
}