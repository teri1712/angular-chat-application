import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Preference} from '../model/dto/preference';
import {Theme} from '../model/dto/theme';
import {ChatIdentifier, toIdString} from "../model/dto/chat-identifier";
import {environment} from "../environments";
import {v4 as uuidv4} from "uuid";

@Injectable({providedIn: 'root'})
export class PreferenceService {

      constructor(private http: HttpClient) {
      }

      updatePreference(identifier: ChatIdentifier, preference: Preference) {
            const url = `/chats/${encodeURIComponent(toIdString(identifier))}/preference`;
            const body = {
                  iconId: preference.iconId,
                  roomName: preference.roomName,
                  themeId: preference.theme?.id ?? null
            };
            this.http.put<void>(environment.API_URL + url, body, {
                  headers: {
                        'Idempotency-key': uuidv4()
                  }
            }).subscribe();
      }

      getThemes(): Observable<Theme[]> {
            return this.http.get<Theme[]>(environment.API_URL + '/themes');
      }
}
