import {ChatEvent} from "../model/dto/chat-event";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {InjectionToken} from "@angular/core";

export abstract class EventHandler {

      constructor(protected readonly http: HttpClient) {
      }

      abstract supports(event: ChatEvent): boolean;

      abstract handle(event: ChatEvent): Observable<ChatEvent>
}


export const HANDLERS = new InjectionToken<EventHandler[]>('EVENT_HANDLERS');