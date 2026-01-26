import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Preference} from '../../model/preference';
import {Theme} from '../../model/theme';
import {ChatIdentifier} from "../../model/chat-identifier";
import {environment} from "../../environments";
import {v4 as uuidv4} from "uuid";

@Injectable({providedIn: 'root'})
export class PreferenceService {

      constructor(private http: HttpClient) {
      }

      updatePreference(identifier: ChatIdentifier, preference: Preference) {
            const url = `/chats/${encodeURIComponent(identifier.toString())}/preference`;
            const body = {
                  resourceId: preference.resourceId,
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
            return this.http.get<Theme[]>(environment.API_URL + '/chats/themes');
      }
}
