import {EventHandler} from "./event-handler";
import {ChatEvent} from "../model/dto/chat-event";
import {Observable} from "rxjs";
import {Injectable} from "@angular/core";
import {environment} from "../environments";
import {toIdString} from "../model/dto/chat-identifier";
import {HttpClient} from "@angular/common/http";

@Injectable()
export class SeenHandler extends EventHandler {

      constructor(http: HttpClient) {
            super(http);
      }

      handle(event: ChatEvent): Observable<ChatEvent> {
            const chat = event.chat;
            const chatIdentifier = chat.identifier;
            const url = environment.API_URL + '/chats/' + encodeURIComponent(toIdString(chatIdentifier)) + '/seen-events';
            return this.http
                    .post<ChatEvent>(url, event.seenEvent!, {
                          headers: {
                                'Content-Type': 'application/json',
                                'Idempotency-key': event.idempotencyKey
                          },
                    });
      }

      supports(event: ChatEvent): boolean {
            return !!event.seenEvent;
      }
}
