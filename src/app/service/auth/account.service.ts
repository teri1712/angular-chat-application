import {Injectable} from '@angular/core';
import {AccountRepository} from './account-repository';
import {BehaviorSubject, catchError, filter, map, Observable, of, switchMap, take, throwError} from "rxjs";
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParams, HttpResponse} from "@angular/common/http";
import {environment} from "../../environments";
import {Authenticator} from "./authenticator";
import {Account} from "../../model/dto/account";
import {SignUpRequest} from "../../model/dto/sign-up-request";
import {SignInRequest} from "../../model/dto/sign-in-request";
import {Profile} from "../../model/dto/profile";
import {TokenListener, TokenStore} from "./token.store";
import {CredentialInterceptor} from "./credential.interceptor";


@Injectable({
      providedIn: 'root',
})
export class AccountService implements AccountRepository, Authenticator, TokenListener {

      private readonly accountSubject
              = new BehaviorSubject<Profile | null | undefined>(undefined);

      constructor(private httpClient: HttpClient, private readonly tokenStore: TokenStore, private readonly credentialInterceptor: CredentialInterceptor) {
            this.init()
      }

      loginOAuth2(idToken: string): Observable<Profile> {
            const headers = new HttpHeaders({
                  'Oauth2-Token': idToken
            });

            return this.httpClient.post<Account>(
                    environment.API_URL + "/tokens/oauth2",
                    null,
                    {headers}
            ).pipe(
                    map((account) => {
                          this.onAccountLogin(account)
                          return account.profile
                    })
            );
      }

      onTokenChange(token: string): void {
            this.tokenStore.accessToken = token;
      }

      onRefreshExpired(): void {
            this.onAccountLogout()
      }


      private init() {
            this.httpClient.get<Profile>(environment.API_URL + "/profiles/me", {
                  observe: 'body'
            }).subscribe(
                    (profile) => {
                          this.onAutoLogin(profile)

                    },
                    (error: HttpErrorResponse) => {
                          if (error.status >= 400 && error.status < 500) {
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

      private onAutoLogin(profile: Profile) {
            this.accountSubject.next(profile);
      }


      private onAccountLogin(account: Account) {
            this.accountSubject.next(account.profile);

            const tokens = account.accessToken;
            if (tokens) {
                  this.tokenStore.accessToken = tokens.accessToken;
                  this.tokenStore.refreshToken = tokens.refreshToken;
            }
      }

      private onAccountLogout() {
            this.tokenStore.removeTokens()
            this.accountSubject.next(null);
      }

      get currentUser(): Profile | null {
            return this.accountSubject.value ?? null;
      }


      get accountObservable(): Observable<Profile | null> {
            return this.accountSubject.pipe(
                    filter(profile => profile !== undefined),
                    take(1)
            )
      }

      signUp(body: SignUpRequest): Observable<Profile> {
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

      signIn(body: SignInRequest): Observable<Profile> {
            if (this.accountSubject.value) {
                  throw new Error('There is already a user.');
            }
            const params = new HttpParams()
                    .set('username', body.username)
                    .set('password', body.password);
            return this.httpClient.post<Account>(environment.API_URL + "/login", params.toString(), {
                  observe: 'body',
                  headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                  }
            }).pipe(
                    map((account) => {
                          this.onAccountLogin(account)
                          return account.profile
                    }), catchError((err: HttpErrorResponse) => {
                          const problem = err.error;
                          return throwError(() => new Error(problem.detail));
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

      changePassword(oldPassword: string, newPassword: string): Observable<any> {

            const refreshToken = this.tokenStore.refreshToken
            if (!refreshToken) {
                  this.onAccountLogout()
                  return of(false);
            }

            const params = new HttpParams()
                    .set('password', oldPassword)
                    .set('new_password', newPassword)
                    .set('refresh_token', refreshToken);
            return this.httpClient.post(environment.API_URL + "/profiles/me/profile/password", params.toString(), {
                  headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                  }
            });
      }

}
