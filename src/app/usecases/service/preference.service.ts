import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Preference} from '../../model/preference';
import {Theme} from '../../model/theme';
import {ChatIdentifier} from "../../model/chat-identifier";
import {environment} from "../../environments";

@Injectable({providedIn: 'root'})
export class PreferenceService {

      constructor(private http: HttpClient) {
      }

      updatePreference(identifier: ChatIdentifier, preference: Preference) {
            const url = `/chats/${encodeURIComponent(identifier.toString())}/preference`;
            this.http.patch<Preference>(environment.API_URL + url, preference).subscribe();
      }

      getThemes(): Observable<Theme[]> {
            return this.http.get<Theme[]>(environment.API_URL + '/chats/themes');
      }
}
