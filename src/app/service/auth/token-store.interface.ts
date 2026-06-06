import {Signal} from '@angular/core';
import {Profile} from "../../model/dto/profile";

/**
 * Read-only view of the token store.
 * Components and services that only need to read session state inject this.
 * Only data-layer classes that manage session mutations inject TokenStore directly.
 */
export abstract class ITokenStore {
    abstract readonly isLoggedIn: Signal<boolean>;
    abstract readonly sessionExpired: Signal<boolean>;
    abstract accessToken: Signal<string | null>

    abstract getAccessToken(): string | null;
}

export abstract class IProfileStore {
    abstract readonly profile: Signal<Profile | null>;

}