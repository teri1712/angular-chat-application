import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {AuthGuard} from './auth.guard';
import {SplashComponent} from './ui/splash/splash.component';
import {CredentialInterceptor} from "./service/auth/credential.interceptor";
import {AccountService} from "./service/auth/account.service";
import {AccountRepository} from "./service/auth/account-repository";
import {Authenticator} from "./service/auth/authenticator";
import {IconRegistry} from './res/IconRegistry';
import {RouteReuseStrategy} from "@angular/router";
import {ReuseConversationListStrategy} from "./service/cache/route/dialog-list-route-resuse";
import {ITokenStore, TokenStore} from "./service/auth/token.store";
import {UploadService} from "./service/upload-service";
import {ThemeService} from "./service/theme-service";

@NgModule({
      declarations: [AppComponent, SplashComponent],
      imports: [BrowserModule, AppRoutingModule],
      bootstrap: [AppComponent],
      providers: [provideAnimationsAsync(),
            AuthGuard,
            UploadService,
            provideHttpClient(withInterceptorsFromDi()),
            {
                  provide: HTTP_INTERCEPTORS,
                  useClass: CredentialInterceptor,
                  multi: true,
            },
            {
                  provide: AccountRepository,
                  useExisting: AccountService
            },
            {
                  provide: ITokenStore,
                  useExisting: TokenStore
            },
            {
                  provide: Authenticator,
                  useExisting: AccountService
            },
            {
                  provide: RouteReuseStrategy,
                  useClass: ReuseConversationListStrategy
            },
      ],
})
export class AppModule {
      constructor(iconRegistry: IconRegistry, themeService: ThemeService,) {
      }
}
