import {Injectable} from '@angular/core';
import {
      ActivatedRouteSnapshot,
      CanActivate,
      GuardResult,
      MaybeAsync,
      Router,
      RouterStateSnapshot,
} from '@angular/router';
import {map} from 'rxjs';
import {AccountRepository} from "./core/service/auth/account-repository";

@Injectable()
export class AuthGuard implements CanActivate {

      constructor(
              private accountRepository: AccountRepository,
              private router: Router
      ) {
      }

      canActivate(
              route: ActivatedRouteSnapshot,
              state: RouterStateSnapshot
      ): MaybeAsync<GuardResult> {
            return this.accountRepository.accountObservable.pipe(
                    map((auth) => {
                          if (!auth) {
                                this.router.navigate(['/auth/login']);
                          }
                          return !!auth;
                    })
            );
      }
}
