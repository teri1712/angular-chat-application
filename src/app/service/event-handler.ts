import {MessageState} from "../model/dto/message-state";
import {Observable} from "rxjs";
import {InjectionToken} from "@angular/core";
import {MessagePosting} from "./message-service";

export abstract class EventHandler {

      abstract supports(posting: MessagePosting): boolean;

      abstract mock(posting: MessagePosting): MessageState | null;

      abstract handle(posting: MessagePosting): Observable<any>
}


export const HANDLERS = new InjectionToken<EventHandler[]>('EVENT_HANDLERS');