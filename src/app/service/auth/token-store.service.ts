import {computed, Injectable, signal} from '@angular/core';
import {IProfileStore, ITokenStore} from "./token-store.interface";
import {Profile} from "../../model/dto/profile";
import {AccessToken} from "../../model/dto/access-token";

const KEYS = {
    ACCESS: 'chat_access_token',
    REFRESH: 'chat_refresh_token',
    PROFILE: 'chat_profile',
} as const;

@Injectable()
export class TokenStore implements ITokenStore, IProfileStore {
    private readonly _profile = signal<Profile | null>(this._loadProfile());
    private readonly _sessionExpired = signal(false);
    private readonly _accessToken = signal(this.getAccessToken())

    readonly accessToken = this._accessToken.asReadonly()
    readonly profile = this._profile.asReadonly();
    readonly isLoggedIn = computed(() => !!this._profile());
    /** True when the server has invalidated the refresh token. */
    readonly sessionExpired = this._sessionExpired.asReadonly();

    storeSession(profile: Profile, tokens: AccessToken): void {
        localStorage.setItem(KEYS.ACCESS, tokens.accessToken);
        localStorage.setItem(KEYS.REFRESH, tokens.refreshToken);
        localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
        this._profile.set(profile);
        this._accessToken.set(tokens.accessToken)
        this._sessionExpired.set(false);
    }

    /** Only update the access token (used after token refresh — profile stays the same). */
    updateAccessToken(accessToken: string): void {
        localStorage.setItem(KEYS.ACCESS, accessToken);
        this._accessToken.set(accessToken)
    }

    updateProfile(profile: Profile): void {
        localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
        this._profile.set(profile);
    }

    clearSession(): void {
        Object.values(KEYS).forEach(k => localStorage.removeItem(k));
        this._profile.set(null);
        this._sessionExpired.set(false);
    }

    /** Signal that the server-side session is gone (refresh token invalidated). */
    markSessionExpired(): void {
        this._sessionExpired.set(true);
    }

    getAccessToken(): string | null {
        return localStorage.getItem(KEYS.ACCESS);
    }

    getRefreshToken(): string | null {
        return localStorage.getItem(KEYS.REFRESH);
    }

    private _loadProfile(): Profile | null {
        const raw = localStorage.getItem(KEYS.PROFILE);
        try {
            return raw ? (JSON.parse(raw) as Profile) : null;
        } catch {
            return null;
        }
    }
}

