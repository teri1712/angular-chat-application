import {ListRepository} from "./repository";
import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../environments";
import {Observable} from "rxjs";
import {MessageState} from "../../model/dto/message-state";

export type MessageQuery = {
      chatId: string;
      anchorSequenceNumber: number;
}

@Injectable()
export class MessageRepository implements ListRepository<MessageQuery, MessageState> {

      constructor(private readonly httpClient: HttpClient) {
      }

      list(query: MessageQuery): Observable<MessageState[]> {
            const chatId = query.chatId;
            const anchorSequenceNumber = query.anchorSequenceNumber;

            const params = new HttpParams()
                    .set("anchorSequenceNumber", anchorSequenceNumber);

            return this.httpClient.get<MessageState[]>(environment.API_URL + "/chats/" + encodeURIComponent(chatId) + "/messages", {
                  observe: 'body',
                  params: params
            });
      }
}