import {ActivatedRouteSnapshot, DetachedRouteHandle, PRIMARY_OUTLET, RouteReuseStrategy} from "@angular/router";
import {Injectable} from "@angular/core";
import {LoginComponent} from "../../../../auth/login/login.component";


@Injectable()
export class ReuseThreadStrategy implements RouteReuseStrategy {
      private cached?: DetachedRouteHandle

      private isThreadList(route: ActivatedRouteSnapshot): boolean {
            return route.outlet === PRIMARY_OUTLET &&
                    route.routeConfig?.path === 'list'
      }

      retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
            return this.cached ?? null;
      }

      shouldAttach(route: ActivatedRouteSnapshot): boolean {
            return !!this.cached && this.isThreadList(route);
      }

      shouldDetach(route: ActivatedRouteSnapshot): boolean {
            return this.isThreadList(route);
      }

      shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
            if (future.component === LoginComponent && this.cached) {
                  this.cached = undefined;
            }
            return future.routeConfig === curr.routeConfig;
      }

      store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {

            this.cached = handle ?? undefined
      }

}