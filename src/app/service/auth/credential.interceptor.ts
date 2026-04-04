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
import {catchError, finalize, Observable, switchMap, tap} from "rxjs";
import {AccessToken} from "../../model/dto/access-token";
import {environment} from "../../environments";
import {JwtHelperService} from "@auth0/angular-jwt";
import {TokenStore} from "./token.store";
import {Injectable} from "@angular/core";
import {Account} from "../../model/dto/account";

@Injectable({
      providedIn: 'root',
})
export class CredentialInterceptor implements HttpInterceptor {

      readonly anonymousUrls = new Set(["/login", "/signup", "/tokens/refresh", "/tokens/oauth2"])

      private readonly jwtHelper = new JwtHelperService();
      private currentRefresh?: Observable<Account>;

      constructor(private readonly tokenStore: TokenStore, private readonly client: HttpClient) {
      }


      private set accessToken(accessToken: AccessToken) {
            this.tokenStore.accessToken = accessToken.accessToken
            this.tokenStore.refreshToken = accessToken.refreshToken
      }


      private refresh(refreshToken: string): Observable<Account> {
            if (this.currentRefresh) {
                  return this.currentRefresh;
            }
            const params = new HttpParams().set('refresh_token', refreshToken);
            this.currentRefresh = this.client
                    .post<Account>(
                            environment.API_URL + '/tokens/refresh',
                            params.toString(),
                            {
                                  observe: 'body',
                                  headers: {
                                        'Content-Type': 'application/x-www-form-urlencoded'
                                  }
                            })
                    .pipe(
                            catchError((err: HttpErrorResponse) => {
                                  this.currentRefresh = undefined;
                                  this.tokenStore.removeTokens()
                                  throw err;
                            }),
                            tap((body) => {
                                  this.currentRefresh = undefined;
                                  this.accessToken = body.accessToken
                            }),
                            finalize(() => {
                                  this.currentRefresh = undefined;
                            })
                    );
            return this.currentRefresh
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

            const pathOnly = new URL(req.url).pathname;
            if (pathOnly == "/logout") {
                  const refresh = this.tokenStore.refreshToken;
                  if (refresh)
                        req = req.clone({
                              params: req.params.set('refresh_token', refresh)
                        });
                  return next.handle(req).pipe(finalize(() => {
                        this.tokenStore.removeTokens()
                  }));
            }
            let res: Observable<HttpEvent<any>>;
            if (this.anonymousUrls.has(pathOnly)) {
                  res = next.handle(req)
            } else {
                  req = this.includeToken(req);
                  res = next.handle(req).pipe(
                          catchError((err: HttpErrorResponse) => {
                                if (err.status == HttpStatusCode.Unauthorized) {
                                      const refreshToken = this.tokenStore.refreshToken;
                                      if (
                                              refreshToken != null &&
                                              !this.jwtHelper.isTokenExpired(refreshToken)) {
                                            return this.refresh(refreshToken).pipe(
                                                    switchMap((token) => {
                                                          if (!token) {
                                                                throw err;
                                                          }
                                                          req = this.includeToken(req)
                                                          return next.handle(req);
                                                    })
                                            );
                                      }
                                }
                                throw err;
                          })
                  );

            }

            return res.pipe(
                    tap(event => {
                          if (event instanceof HttpResponse && event.body.accessToken) {
                                this.accessToken = event.body.accessToken
                          }
                    })
            );

      }
}
