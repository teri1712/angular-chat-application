import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Theme} from '../model/dto/theme';
import {environment} from "../environments";

@Injectable({providedIn: 'root'})
export class PreferenceService {

      constructor(private http: HttpClient) {
      }

      updatePreference(chatId: string, request: PreferenceRequest) {
            const url = `/chats/${encodeURIComponent(chatId)}/preference`;
            this.http.patch<void>(environment.API_URL + url, request, {}).subscribe();
      }

      getThemes(): Observable<Theme[]> {
            return this.http.get<Theme[]>(environment.API_URL + '/themes');
      }
}


export interface PreferenceRequest {
      iconId?: number,
      customName?: string,
      customAvatar?: string,
      themeId?: number
}
