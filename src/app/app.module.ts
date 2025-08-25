import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {AuthGuard} from './auth.guard';
import {SplashComponent} from './splash/splash.component';
import {CredentialInterceptor} from "./usecases/service/auth/credential.interceptor";
import {AccountService} from "./usecases/service/auth/account.service";
import {AccountRepository} from "./usecases/service/auth/account-repository";
import {DevelopmentModeInterceptor} from "./mock/development-mode-interceptor.service";
import {Authenticator} from "./usecases/service/auth/authenticator";
import {IconRegistry} from './res/IconRegistry';
import {RouteReuseStrategy} from "@angular/router";
import {ReuseThreadStrategy} from "./usecases/service/cache/route/thread-resuse";

@NgModule({
      declarations: [AppComponent, SplashComponent],
      imports: [BrowserModule, AppRoutingModule],
      bootstrap: [AppComponent],
      providers: [provideAnimationsAsync(),
            AuthGuard,
            provideHttpClient(withInterceptorsFromDi()),
            {
                  provide: HTTP_INTERCEPTORS,
                  useClass: DevelopmentModeInterceptor,
                  multi: true,
            },
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
                  provide: Authenticator,
                  useExisting: AccountService
            },
            {
                  provide: RouteReuseStrategy,
                  useClass: ReuseThreadStrategy
            },],
})
export class AppModule {
      constructor(iconRegistry: IconRegistry) {
      }
}
