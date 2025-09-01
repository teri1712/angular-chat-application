import {ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy} from "@angular/router";
import {Injectable} from "@angular/core";
import {AccountRepository} from "../../auth/account-repository";


@Injectable()
export class ReuseDialogListStrategy implements RouteReuseStrategy {
      private cached?: DetachedRouteHandle

      constructor(private readonly accounts: AccountRepository) {
      }

      private isDialogList(route: ActivatedRouteSnapshot): boolean {
            const isList = route.routeConfig?.path === 'list';
            const inSidebar = route.pathFromRoot.some(s => s.outlet === 'side-bar');
            return isList && inSidebar;
      }

      private get isLoggedIn(): boolean {
            return !!this.accounts.account;
      }

      retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
            if (!this.isLoggedIn) return null;
            return this.cached ?? null;
      }

      shouldAttach(route: ActivatedRouteSnapshot): boolean {
            return this.isLoggedIn && !!this.cached && this.isDialogList(route);
      }

      shouldDetach(route: ActivatedRouteSnapshot): boolean {
            return this.isLoggedIn && this.isDialogList(route);
      }

      shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
            if (!this.isLoggedIn && this.cached) {
                  this.cached = undefined;
            }
            return future.routeConfig === curr.routeConfig;
      }

      store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {
            if (!this.isLoggedIn) {
                  this.cached = undefined;
                  return;
            }
            this.cached = handle ?? undefined
      }

}