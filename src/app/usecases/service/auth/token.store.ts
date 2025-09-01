import {Injectable} from '@angular/core';

const TOKEN_KEY = 'JWT_TOKEN';
const REFRESH_TOKEN_KEY = 'JWT_REFRESH_TOKEN';

@Injectable({
      providedIn: 'root',
})
export class TokenStore {

      // constructor() {
      //       window.localStorage.removeItem(TOKEN_KEY);
      // }

      get accessToken(): string | null {
            return window.localStorage.getItem(TOKEN_KEY);
      }

      set accessToken(accessToken: string | null) {
            if (accessToken) {
                  window.localStorage.setItem(TOKEN_KEY, accessToken);
            } else {
                  window.localStorage.removeItem(TOKEN_KEY);
            }
      }

      get refreshToken(): string | null {
            return window.localStorage.getItem(REFRESH_TOKEN_KEY);
      }

      set refreshToken(refreshToken: string | null) {
            if (refreshToken) {
                  window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
            } else {
                  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
            }
      }

      removeTokens(): void {
            window.localStorage.removeItem(TOKEN_KEY);
            window.localStorage.removeItem(REFRESH_TOKEN_KEY);
      }
}
