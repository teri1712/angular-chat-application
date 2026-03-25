import {Injectable} from '@angular/core';

const TOKEN_KEY = 'JWT_TOKEN';
const REFRESH_TOKEN_KEY = 'JWT_REFRESH_TOKEN';

@Injectable({
      providedIn: 'root',
})
export class TokenStore implements ITokenStore {

      private tokenListeners: TokenListener[] = [];

      addTokenListener(listener: TokenListener): void {
            const accessToken = this.accessToken;
            this.tokenListeners.push(listener);
            if (accessToken)
                  listener.onTokenChange(accessToken)
      }

      removeTokenListener(listener: TokenListener): void {
            this.tokenListeners = this.tokenListeners.filter(l => l !== listener);
      }

      get accessToken(): string | null {
            return window.localStorage.getItem(TOKEN_KEY);
      }

      set accessToken(accessToken: string | null) {
            if (accessToken) {
                  window.localStorage.setItem(TOKEN_KEY, accessToken);
                  this.tokenListeners.forEach(listener => listener.onTokenChange(accessToken));
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
            this.tokenListeners.forEach(listener => listener.onLogout());
      }
}


export abstract class ITokenStore {
      abstract readonly accessToken: string | null;
      abstract readonly refreshToken: string | null;

      abstract addTokenListener(listener: TokenListener): void

      abstract removeTokenListener(listener: TokenListener): void
}

export interface TokenListener {
      onTokenChange: (token: string) => void
      onLogout: () => void
};