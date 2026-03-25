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

@Injectable({
      providedIn: 'root',
})
export class CredentialInterceptor implements HttpInterceptor {

      readonly anonymousUrls = new Set(["/login", "/signup", "/tokens/refresh", "/tokens/oauth2"])

      private readonly jwtHelper = new JwtHelperService();
      private currentRefresh?: Observable<AccessToken>;

      constructor(private readonly tokenStore: TokenStore, private readonly client: HttpClient) {
      }


      private set accessToken(accessToken: AccessToken) {
            this.tokenStore.accessToken = accessToken.accessToken
            this.tokenStore.refreshToken = accessToken.refreshToken
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
                            tap((body) => {
                                  this.tokenStore.accessToken = body.accessToken
                                  return body;
                            }),
                            finalize(() => {
                                  this.currentRefresh = undefined;
                            })
                    ));
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
                  return next.handle(req).pipe(tap(event => {
                        if (event instanceof HttpResponse) {
                              this.tokenStore.removeTokens()
                        }
                  }));
            }
            if (this.anonymousUrls.has(pathOnly)) {
                  return next.handle(req).pipe(
                          tap(event => {
                                if (event instanceof HttpResponse && event.body.accessToken) {
                                      this.accessToken = event.body.accessToken
                                }
                          })
                  );
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
                                this.tokenStore.removeTokens()
                          }
                          throw err;
                    })
            );
      }
}
