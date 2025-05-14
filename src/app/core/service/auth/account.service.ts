import {Injectable} from '@angular/core';
import {AccountRepository} from './account-repository';
import {BehaviorSubject, catchError, filter, map, Observable, of, switchMap, take} from "rxjs";
import {HttpClient, HttpErrorResponse, HttpParams, HttpResponse} from "@angular/common/http";
import {environment} from "../../../environments";
import {AccountEntry} from "../../../model/account-entry";
import {Authenticator} from "./authenticator";
import {Account} from "../../../model/account";
import {SignUpRequest} from "../../../model/dto/sign-up-request";
import {SignInRequest} from "../../../model/dto/sign-in-request";

@Injectable({
      providedIn: 'root',
})
export class AccountService implements AccountRepository, Authenticator {

      private readonly accountSubject
              = new BehaviorSubject<Account | null | undefined>(undefined);

      constructor(private httpClient: HttpClient) {
            this.init()
      }


      private init() {
            // this.accountSubject.next(null)
            this.httpClient.get<AccountEntry>(environment.API_URL + "/account", {
                  observe: 'body'
            }).subscribe(
                    (accountEntry) => {
                          this.onAccountLogin(accountEntry.account)
                    },
                    (error: HttpErrorResponse) => {
                          if (error.status === 401 || error.status === 403) {
                                this.accountSubject.next(null)
                          } else {
                                //network
                                window.alert(error.message);
                          }
                    },
                    () => {
                    }
            )
      }

      private onAccountLogin(account: Account) {
            this.accountSubject.next(account)
      }

      private onAccountLogout() {
            this.accountSubject.next(null);
      }

      get account(): Account | null {
            return this.accountSubject.value ?? null;
      }


      get accountObservable(): Observable<Account | null> {
            return this.accountSubject.pipe(
                    filter(user => user !== undefined),
                    take(1)
            )
      }

      signUp(body: SignUpRequest): Observable<Account> {
            if (this.account) {
                  throw new Error('There is already a user.');
            }
            const formData = new FormData()
            formData.append("information", new Blob([JSON.stringify(body)], {type: 'application/json'}))
            if (body.file)
                  formData.append("file", body.file)

            return this.httpClient.post(environment.API_URL + "/authentication/sign-up", formData, {
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
            if (this.account) {
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
                          this.onAccountLogin(account)
                          return account
                    })
            )
      }

      logout(): Observable<boolean> {
            if (!this.account) {
                  throw new Error('There is no such account');
            }
            return this.httpClient.post<any>(environment.API_URL + "/logout",
                    new HttpParams().toString(), {
                          observe: 'response',
                          headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                          }
                    }).pipe(
                    map((response: HttpResponse<any>) => {
                          this.onAccountLogout()
                          return true
                    }),
                    catchError((err: HttpErrorResponse) => {
                          return of(err.status != 0)
                    })
            )

      }


}
