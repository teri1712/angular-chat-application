import {Component, OnDestroy, OnInit} from '@angular/core';
import {User} from "../model/user";
import {ActivationEnd, Router} from "@angular/router";
import {ProgressDialogComponent} from "../progress-dialog/progress-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {filter, Subscription} from "rxjs";
import {Authenticator} from "../usecases/service/auth/authenticator";
import {AccountManager} from "../usecases/service/auth/account-manager";
import {settingRoute, threadsRoute} from "../home-route.module";
import {environment} from "../environments";

enum Routes {
      THREAD, SETTINGS
}

@Component({
      selector: 'app-side-nav',
      standalone: false,

      templateUrl: './side-nav.component.html',
      styleUrl: './side-nav.component.css'
})
export class SideNavComponent implements OnInit, OnDestroy {


      protected account!: User;
      protected currentRoute?: Routes;
      private routeSub!: Subscription;


      constructor(
              private authenticator: Authenticator,
              private accountManager: AccountManager,
              private router: Router,
              private matDialog: MatDialog) {

            this.account = this.accountManager.user

      }

      ngOnInit(): void {
            this.routeSub = this.router.events
                    .pipe(filter(e => e instanceof ActivationEnd))
                    .subscribe((e) => {
                          const outlet = e.snapshot.outlet;
                          const routeConfig = e.snapshot.routeConfig;
                          const path = routeConfig?.path;

                          if (outlet === 'side-bar') {
                                if (path === 'thread') {
                                      this.currentRoute = Routes.THREAD
                                } else if (path === 'settings') {
                                      this.currentRoute = Routes.SETTINGS
                                }
                          }
                    });
            this.navigateToThreads()
      }

      ngOnDestroy(): void {
            this.routeSub.unsubscribe();
      }

      protected navigateToSettings() {
            if (this.currentRoute === Routes.SETTINGS) {
                  return
            }
            this.currentRoute = Routes.SETTINGS;
            this.router.navigate(settingRoute);
      }

      protected navigateToThreads() {
            if (this.currentRoute === Routes.THREAD) {
                  return;
            }
            this.currentRoute = Routes.THREAD;
            this.router.navigate(threadsRoute);
      }

      protected logout() {
            const ref = this.matDialog.open(ProgressDialogComponent, {
                  disableClose: true,
                  data: {
                        action_name: "Logging Out",
                  }
            })
            this.authenticator.logout().subscribe(
                    (success) => {
                          if (success) {
                                this.router.navigate(['/auth/login'], {replaceUrl: true});
                          }
                          ref.close();
                    }
            );
      }

      protected readonly Routes = Routes;
      protected readonly environment = environment;
}
