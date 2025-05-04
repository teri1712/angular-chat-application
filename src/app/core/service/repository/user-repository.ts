import {Injectable} from "@angular/core";
import {ListRepository} from "./repository";
import {map, Observable} from "rxjs";
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../../environments";
import {Conversation} from "../../../model/conversation";
import {DialogRepository} from "./dialog-repository";
import {Dialog} from "../../../model/dialog";

@Injectable()
export class UserRepository implements ListRepository<string, Dialog> {

      constructor(
              private readonly httpClient: HttpClient,
              private readonly dialogRepository: DialogRepository) {
      }

      list(name: string): Observable<Dialog[]> {
            const params = new HttpParams().set('query', name);
            return this.httpClient.get<Conversation[]>(environment.API_URL + "/user", {
                  observe: 'body',
                  params: params,
            }).pipe(map(conversations => {
                  return conversations.map((conversation) => this.dialogRepository.get(Conversation.from(conversation)))
            }))
      }
}