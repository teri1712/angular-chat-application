import {
      HttpClient,
      HttpErrorResponse,
      HttpEvent,
      HttpHandler,
      HttpInterceptor,
      HttpParams,
      HttpRequest,
      HttpResponse,
      HttpStatusCode
} from "@angular/common/http";
import {catchError, finalize, map, Observable, switchMap, tap} from "rxjs";
import {AccessToken} from "../../../model/access-token";
import {environment} from "../../../environments";
import {JwtHelperService} from "@auth0/angular-jwt";
import {TokenStore} from "./token.store";
import {Injectable} from "@angular/core";
import {getAuthenticationChannel, UN_AUTHORIZED} from "../event/commons";

@Injectable()
export class CredentialInterceptor implements HttpInterceptor {

      private readonly jwtHelper = new JwtHelperService();
      private currentRefresh?: Observable<AccessToken>;
      private authenticationChannel: BroadcastChannel;

      constructor(private tokenStore: TokenStore, private client: HttpClient) {
            this.authenticationChannel = getAuthenticationChannel();
      }

      private refresh(refreshToken: string): Observable<AccessToken> {
            if (this.currentRefresh) {
                  return this.currentRefresh;
            }
            const params = new HttpParams().set('refresh_token', refreshToken);
            return (this.currentRefresh = this.client
                    .post<AccessToken>(
                            environment.API_URL + '/tokens/refresh',
                            params.toString(),
                            {
                                  observe: 'body',
                                  headers: {
                                        'Content-Type': 'application/x-www-form-urlencoded'
                                  }
                            })
                    .pipe(
                            map((body) => {
                                  this.tokenStore.accessToken = body.accessToken;
                                  return body;
                            }),
                            catchError((err: HttpErrorResponse) => {
                                  if (err.status === HttpStatusCode.Unauthorized) {
                                        this.invalidate();
                                  }
                                  throw err
                            }),
                            finalize(() => {
                                  this.currentRefresh = undefined;
                            })
                    ));
      }

      private invalidate(): void {
            this.tokenStore.removeTokens();
      }

      private saveToken(credential: AccessToken): void {
            this.tokenStore.accessToken = credential.accessToken
            this.tokenStore.refreshToken = credential.refreshToken
      }

      private processLogoutRequest(
              req: HttpRequest<any>,
              next: HttpHandler
      ): Observable<HttpEvent<any>> {
            const refreshToken = this.tokenStore.refreshToken
            if (!refreshToken) {
                  return next.handle(req)
            }
            const includeRefreshToken = new HttpParams(
                    {fromString: req.body as string}
            ).set('refresh_token', refreshToken)

            req = req.clone({
                  body: includeRefreshToken.toString()
            })

            return next.handle(req).pipe(
                    tap(() => {
                          this.invalidate()
                    }),
                    catchError((error: HttpErrorResponse) => {
                          if (error.status === 401 || error.status === 403) {
                                this.invalidate()
                          }
                          throw error
                    })
            )
      }

      private includeToken(req: HttpRequest<any>): HttpRequest<any> {
            const accessToken = this.tokenStore.accessToken;
            if (accessToken) {
                  const headers = req.headers.set('Authorization', `Bearer ${accessToken}`);
                  req = req.clone({
                        headers: headers,
                  });
            }
            return req
      }

      intercept(
              req: HttpRequest<any>,
              next: HttpHandler
      ): Observable<HttpEvent<any>> {
            req = req.clone({
                  headers: req.headers,
                  withCredentials: true
            });
            const logoutReq = req.url.includes('logout');
            if (logoutReq) {
                  return this.processLogoutRequest(req, next);
            }

            req = this.includeToken(req);
            return next.handle(req).pipe(
                    catchError((err: HttpErrorResponse) => {
                          if (err.status === HttpStatusCode.Unauthorized) {
                                const refreshToken = this.tokenStore.refreshToken;
                                if (
                                        refreshToken != null &&
                                        !this.jwtHelper.isTokenExpired(refreshToken)) {
                                      return this.refresh(refreshToken).pipe(
                                              switchMap((token) => {
                                                    if (!token) {
                                                          throw err;
                                                    }
                                                    return next.handle(req);
                                              })
                                      );
                                }
                                this.authenticationChannel.postMessage({
                                      type: UN_AUTHORIZED
                                })
                          }
                          throw err;
                    }),
                    tap((res: HttpEvent<any>) => {
                          if (res instanceof HttpResponse
                                  && !!res.body.account
                                  && !!res.body.account.credential
                          ) {
                                const account = res.body.account
                                if (account.credential) {
                                      this.saveToken(account.credential)
                                      account.credential = undefined
                                }
                          }
                    })
            );
      }
}
