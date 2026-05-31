import {Observable} from "rxjs";
import {TypeMessage} from "../../model/dto/type-message";
import {PreferenceMessage} from "../../model/dto/preference-message";
import {InjectionToken} from "@angular/core";

export interface LiveChatService {

    subscribeRoom(chatId: string): Observable<TypeMessage>;

    subscribeSettings(chatId: string): Observable<PreferenceMessage>;

    typeToRoom(chatId: string): void;

}

export const LIVE_CHAT_SERVICE = new InjectionToken<LiveChatService>('LIVE_CHAT_SERVICE');