import {GetRepository} from "./repository";
import {Online} from "../../../model/Online";
import {map, Observable} from "rxjs";
import {environment} from "../../../environments";
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";

@Injectable()
export class OnlineRepository implements GetRepository<string, Online> {

      constructor(private readonly httpClient: HttpClient) {
      }

      get(username: string): Observable<Online> {
            return this.httpClient.get<Online>(environment.API_URL + "/online/" + encodeURIComponent(username), {
                  observe: 'body',
            }).pipe(map((res: Online) => {
                  return res;
            }))
      }
}