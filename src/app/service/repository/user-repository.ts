import {Injectable} from "@angular/core";
import {ListRepository} from "./repository";
import {Observable} from "rxjs";
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../environments";
import {Profile} from "../../model/dto/profile";
import {User} from "../../model/dto/user";

@Injectable()
export class UserRepository implements ListRepository<string, User> {

      constructor(
              private readonly httpClient: HttpClient) {
      }

      list(name: string): Observable<User[]> {
            const params = new HttpParams().set('query', name);
            return this.httpClient.get<Profile[]>(environment.API_URL + "/users", {
                  observe: 'body',
                  params: params,
            })
      }
}