import {Injectable} from '@angular/core';
import {AccountRepository} from './account-repository';
import {BehaviorSubject, catchError, filter, map, Observable, of, switchMap, take} from "rxjs";
import {HttpClient, HttpErrorResponse, HttpParams, HttpResponse} from "@angular/common/http";
import {environment} from "../../environments";
import {AccountEntry} from "../../model/dto/account-entry";
import {Authenticator} from "./authenticator";
import {Account} from "../../model/dto/account";
import {SignUpRequest} from "../../model/dto/sign-up-request";
import {SignInRequest} from "../../model/dto/sign-in-request";
import {User} from "../../model/dto/user";
import {TokenListener, TokenStore} from "./token.store";
import {CredentialInterceptor} from "./credential.interceptor";

export type PresignedUpload = {
      presignedUploadUrl: string;
      downloadUrl: string;
};

@Injectable({
      providedIn: 'root',
})
export class AccountService implements AccountRepository, Authenticator, TokenListener {

      private readonly accountSubject
              = new BehaviorSubject<Account | null | undefined>(undefined);

      constructor(private httpClient: HttpClient, private readonly tokenStore: TokenStore, private readonly credentialInterceptor: CredentialInterceptor) {
            this.init()
      }

      onTokenChange(token: string): void {
            this.tokenStore.accessToken = token;
      }

      onRefreshExpired(): void {
            this.onAccountLogout()
      }


      private init() {
            this.httpClient.get<AccountEntry>(environment.API_URL + "/accounts/me", {
                  observe: 'body'
            }).subscribe(
                    (accountEntry) => {
                          this.onAccountLogin(accountEntry)
                    },
                    (error: HttpErrorResponse) => {
                          if (error.status === 401 || error.status === 403) {
                                this.onAccountLogout()
                          } else {
                                //network
                          }
                    },
                    () => {
                    }
            )
            this.credentialInterceptor.addTokenListener(this)
      }


      private onAccountLogin(accountEntry: AccountEntry) {
            this.accountSubject.next(accountEntry.account);
            const tokens = accountEntry.tokenCredential;
            if (tokens) {
                  this.tokenStore.accessToken = tokens.accessToken;
                  this.tokenStore.refreshToken = tokens.refreshToken;
            }
      }

      private onAccountLogout() {
            this.tokenStore.removeTokens()
            this.accountSubject.next(null);
      }

      get currentUser(): User {
            return this.accountSubject.value?.user!;
      }


      get accountObservable(): Observable<User | null> {
            return this.accountSubject.pipe(
                    filter(user => user !== undefined),
                    map(account => account?.user ?? null),
                    take(1)
            )
      }

      signUp(body: SignUpRequest): Observable<Account> {
            if (this.accountSubject.value) {
                  throw new Error('There is already a user.');
            }
            const payload = {
                  username: body.username,
                  password: body.password,
                  name: body.name,
                  gender: body.gender,
                  dob: body.dob,
                  avatar: body.avatar
            };

            return this.httpClient.post(environment.API_URL + "/users", payload, {
                  observe: 'response',
                  responseType: 'text'
            }).pipe(
                    switchMap((response) => {
                          return this.signIn({
                                username: body.username,
                                password: body.password
                          })
                    })
            )
      }

      signIn(body: SignInRequest): Observable<Account> {
            if (this.accountSubject.value) {
                  throw new Error('There is already a user.');
            }
            const params = new HttpParams()
                    .set('username', body.username)
                    .set('password', body.password);
            return this.httpClient.post<AccountEntry>(environment.API_URL + "/login", params.toString(), {
                  observe: 'body',
                  headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                  }
            }).pipe(
                    map((accountEntry) => {
                          const account = accountEntry.account
                          this.onAccountLogin(accountEntry)
                          return account
                    })
            )
      }

      logout(): Observable<boolean> {
            if (!this.accountSubject.value) {
                  throw new Error('There is no such account');
            }
            const refreshToken = this.tokenStore.refreshToken
            if (!refreshToken) {
                  this.onAccountLogout()
                  return of(true);
            }
            const includeRefreshToken = new HttpParams().set('refresh_token', refreshToken)


            return this.httpClient.post<any>(environment.API_URL + "/logout",
                    includeRefreshToken.toString(), {
                          observe: 'response',
                          headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                          }
                    }).pipe(
                    map((response: HttpResponse<any>) => {
                          this.onAccountLogout()
                          return true
                    }),
                    catchError((error: HttpErrorResponse) => {
                          if (error.status === 401 || error.status === 403) {
                                this.onAccountLogout()
                                return of(true);
                          }
                          throw error

                    })
            )

      }

      get loginAtVersion(): number | null {
            return this.accountSubject.value?.syncContext.eventVersion ?? null
      }

}
