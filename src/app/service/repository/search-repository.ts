import {ListRepository} from "./repository";
import {MessageHistory} from "../../model/dto/message-history";
import {Observable} from "rxjs";
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments";

@Injectable()
export class SearchRepository implements ListRepository<String, MessageHistory> {

      constructor(private readonly httpClient: HttpClient) {
      }


      list(query: string): Observable<MessageHistory[]> {
            return this.httpClient.get<MessageHistory[]>(environment.API_URL + "/me/history/messages?query=" + encodeURIComponent(query), {observe: 'body'});
      }
}