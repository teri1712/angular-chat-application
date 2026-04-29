import {ApplicationConfig, provideZonelessChangeDetection} from '@angular/core';
import {provideRouter, Routes} from '@angular/router';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {authGuard} from './auth.guard';
import {authInterceptor} from "./service/auth/credential.interceptor";
import {AccountService} from "./service/auth/account.service";
import {TokenStore} from "./service/auth/token-store.service";
import {IProfileStore, ITokenStore} from "./service/auth/token-store.interface";
import {Authenticator} from "./service/auth/authenticator";
import {UploadService} from "./service/upload-service";

const routes: Routes = [
    {
        path: '',
        redirectTo: '/auth/login',
        pathMatch: "full"
    },
    {
        path: 'auth',
        loadChildren: () => import('./ui/auth/auth.module').then((m) => m.AuthModule),
    },
    {
        path: 'home',
        canActivate: [authGuard],
        loadChildren: () => import('./home.module').then((m) => m.HomeModule),
    },
];

export const appConfig: ApplicationConfig = {
    providers: [
        provideAnimationsAsync(),
        UploadService,
        provideHttpClient(withInterceptors([authInterceptor])),
        {
            provide: TokenStore,
            useExisting: AccountService
        },
        {
            provide: ITokenStore,
            useExisting: TokenStore
        },
        {
            provide: IProfileStore,
            useExisting: TokenStore
        },
        {
            provide: Authenticator,
            useExisting: AccountService
        },
        provideZonelessChangeDetection(),
        provideRouter(routes),
    ],
};
