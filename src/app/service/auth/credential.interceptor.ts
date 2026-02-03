import {
      HttpClient,
      HttpErrorResponse,
      HttpEvent,
      HttpHandler,
      HttpInterceptor,
      HttpParams,
      HttpRequest,
      HttpStatusCode
} from "@angular/common/http";
import {catchError, finalize, Observable, switchMap, tap} from "rxjs";
import {AccessToken} from "../../model/dto/access-token";
import {environment} from "../../environments";
import {JwtHelperService} from "@auth0/angular-jwt";
import {ITokenStore, TokenListener} from "./token.store";
import {Injectable} from "@angular/core";

@Injectable({
      providedIn: 'root',
})
export class CredentialInterceptor implements HttpInterceptor {

      readonly anonymousUrls = new Set(["/login", "/signup", "/logout", "/tokens/refresh", "/tokens/oauth2"])

      private readonly jwtHelper = new JwtHelperService();
      private currentRefresh?: Observable<AccessToken>;
      private tokenListeners: TokenListener[] = [];

      constructor(private tokenStore: ITokenStore, private client: HttpClient) {
      }

      addTokenListener(listener: TokenListener) {
            this.tokenListeners.push(listener);
      }

      removeTokenListener(listener: TokenListener) {
            this.tokenListeners = this.tokenListeners.filter(l => l !== listener);
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
                                  this.tokenListeners.forEach((listener) => {
                                        listener.onTokenChange(body.accessToken);
                                  })
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
            if (!req.url.startsWith("http"))
                  window.alert("vcl")
            if (this.anonymousUrls.has(pathOnly)) {
                  return next.handle(req);
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
                                this.tokenListeners.forEach((listener) => {
                                      listener.onRefreshExpired()
                                })
                          }
                          throw err;
                    })
            );
      }
}
