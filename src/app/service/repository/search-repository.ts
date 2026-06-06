import {ListRepository} from "./repository";
import {MessageHistory} from "../../model/dto/message-history";
import {Observable} from "rxjs";
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments";


export type SearchQuery = {
    chatId: string;
    query: string;
}

@Injectable()
export class SearchRepository implements ListRepository<SearchQuery, MessageHistory> {

    constructor(private readonly httpClient: HttpClient) {
    }


    list(query: SearchQuery): Observable<MessageHistory[]> {
        return this.httpClient.get<MessageHistory[]>(environment.API_URL + "/chat-histories/" + encodeURIComponent(query.chatId) + "?query=" + encodeURIComponent(query.query), {observe: 'body'});
    }
}