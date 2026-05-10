import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
  HttpClient,
  HttpBackend,
  HttpParams
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { TokenStore } from "./token-store.service";
import { Account } from "../../model/dto/account";
import { environment } from "../../environments";

@Injectable()
export class CredentialInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(private tokenStore: TokenStore, private backend: HttpBackend) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip if session is already known expired
    if (this.tokenStore.sessionExpired()) {
      return next.handle(req);
    }

    const token = this.tokenStore.getAccessToken();
    let authReq = req;
    if (token) {
      authReq = this.addTokenHeader(req, token);
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        const isRefresh = req.url.includes('/tokens/refresh');
        const isLogin = req.url.includes('/login');

        // If the 401 carries a business-logic detail (e.g. "Wrong password"),
        // it is NOT a token-expiry error — pass it straight to the caller.
        const hasProblemDetail = typeof error.error === 'object' && error.error?.detail;

        if (error.status === 401 && !isRefresh && !isLogin && !hasProblemDetail) {
          return this.handle401Error(req, next);
        }

        return throwError(() => error);
      })
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = this.tokenStore.getRefreshToken();
      if (!refreshToken) {
        this.isRefreshing = false;
        this.tokenStore.markSessionExpired();
        return throwError(() => new Error('Refresh token missing'));
      }

      // Use HttpBackend to bypass interceptor chain for the refresh call
      const http = new HttpClient(this.backend);
      const body = new HttpParams().set('refresh_token', refreshToken);

      return http.post<Account>(`${environment.API_URL}/tokens/refresh`, body, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }).pipe(
        switchMap((res: Account) => {
          this.isRefreshing = false;
          const newToken = res.accessToken.accessToken;
          this.tokenStore.updateAccessToken(newToken);
          this.refreshTokenSubject.next(newToken);
          return next.handle(this.addTokenHeader(request, newToken));
        }),
        catchError((err) => {
          this.isRefreshing = false;
          this.tokenStore.markSessionExpired();
          return throwError(() => err);
        })
      );
    } else {
      // If refresh is already in progress, wait for the new token
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap((token) => next.handle(this.addTokenHeader(request, token!)))
      );
    }
  }

  private addTokenHeader(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }
}
