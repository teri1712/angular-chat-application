import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {ITokenStore} from "./service/auth/token-store.interface";

export const authGuard: CanActivateFn = () => {
    const tokenService = inject(ITokenStore);
    const router = inject(Router);
    return tokenService.getAccessToken()
        ? true
        : router.createUrlTree(['/auth/login']);
};

