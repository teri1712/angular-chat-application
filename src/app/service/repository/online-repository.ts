import {Repository} from "./repository";
import {Online} from "../../model/dto/online";
import {map, Observable, of, tap} from "rxjs";
import {environment} from "../../environments";
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";

@Injectable()
export class OnlineRepository implements Repository<string, Online> {

      private onlineMap = new Map<string, Online>();

      constructor(private readonly httpClient: HttpClient) {
      }

      list(): Observable<Online[]> {
            return this.httpClient.get<Online[]>(environment.API_URL + "/presences", {
                  observe: 'body',
            }).pipe(tap((res: Online[]) => {
                  res.forEach((online: Online) => {
                        this.onlineMap.set(online.username, online);
                        return online;
                  });
            }))
      }

      find(username: string): Online | undefined {
            return this.onlineMap.get(username);
      }

      get(username: string): Observable<Online> {
            const twoMinutesAgo = Date.now() - 2 * 60 * 1000;
            const online = this.onlineMap.get(username);
            if (online) {
                  const onlineAt = new Date(online.at).getTime();
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