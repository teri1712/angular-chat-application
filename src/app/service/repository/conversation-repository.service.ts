import {ListRepository} from "./repository";
import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../environments";
import {Observable} from "rxjs";
import {Conversation} from "../../model/dto/Conversation";
import CacheService from "../cache/data/cache-service";

@Injectable()
export class ConversationRepository implements ListRepository<Number, Conversation> {

      constructor(private readonly httpClient: HttpClient, private readonly cacheService: CacheService) {
      }

      list(revisionNumber?: number): Observable<Conversation[]> {
            let params = new HttpParams();
            if (revisionNumber) {
                  params = params.set("anchorRevisionNumber", revisionNumber);
            }
            return this.httpClient.get<Conversation[]>(environment.API_URL + "/me/conversations", {
                  observe: 'body',
                  params: params,
            });
      }
}