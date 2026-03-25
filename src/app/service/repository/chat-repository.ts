import {GetRepository} from "./repository";
import {Chat} from "../../model/dto/chat";
import {BehaviorSubject, filter, Observable} from "rxjs";
import {environment} from "../../environments";
import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";

@Injectable()
export class ChatRepository implements GetRepository<string, Chat> {

      constructor(
              private httpClient: HttpClient,
      ) {
      }

      get(chatId: string): Observable<Chat> {
            return this.httpClient.get<Chat>(environment.API_URL + "/chats/" + chatId, {
                  observe: 'body',
            });
      }

}


@Injectable()
export class DirectRepository implements GetRepository<string, string> {

      private knownDirect = new Map<string, BehaviorSubject<string | undefined>>();

      constructor(
              private httpClient: HttpClient,
      ) {
      }

      get(partnerId: string): Observable<string> {
            const chatId = this.knownDirect.get(partnerId)
                    ?? new BehaviorSubject<string | undefined>(undefined);
            this.knownDirect.set(partnerId, chatId);

            if (!chatId.value) {
                  this.httpClient.put<any>(environment.API_URL + "/direct-chats/" + encodeURIComponent(partnerId), {}, {
                        observe: 'body',
                  }).subscribe((res: any) => {
                        chatId.next(res.mapping.chatId);
                  });
            }
            return chatId.asObservable().pipe(
                    filter(id => id != undefined));
      }


}