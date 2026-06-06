import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface AppConfig {
  API_URL: string;
  WEBSOCKET_HOST: string;
  GOOGLE_CLIENT_ID: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
  private config: AppConfig | undefined;

  constructor(private http: HttpClient) {}

  async loadConfig() {
    try {
      this.config = await firstValueFrom(
        this.http.get<AppConfig>('/config.json')
      );
    } catch (err) {
      console.error('Could not load configuration', err);
      // Fallback or default values if needed
      this.config = {
        API_URL: 'http://localhost:8080',
        WEBSOCKET_HOST: 'ws://localhost:8080',
        GOOGLE_CLIENT_ID: '863552069596-2qbk9ci1jmdic6271pluqsd7snm11mof.apps.googleusercontent.com'
      };
    }
    (window as any).APP_CONFIG = this.config;
  }

  get apiUrl(): string {
    return this.config?.API_URL || '';
  }

  get websocketHost(): string {
    return this.config?.WEBSOCKET_HOST || '';
  }

  get googleClientId(): string {
    return this.config?.GOOGLE_CLIENT_ID || '';
  }
}
