import {Component, Injector, OnDestroy, OnInit} from '@angular/core';
import {Profile} from "../../model/dto/profile";
import {ActivationEnd, Router} from "@angular/router";
import {ProgressDialogComponent} from "../progress-dialog/progress-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {filter, Observable, Subscription} from "rxjs";
import {Authenticator} from "../../service/auth/authenticator";
import {settingRoute, threadsRoute} from "../../home-route.module";
import {environment} from "../../environments";
import ProfileService from "../../service/profile-service";
import {CreateGroupDialogComponent} from "../create-group-dialog/create-group-dialog.component";

enum Routes {
      THREAD, SETTINGS, SEARCH
}

@Component({
      selector: 'app-side-nav',
      standalone: false,

      templateUrl: './side-nav.component.html',
      styleUrl: './side-nav.component.css'
})
export class SideNavComponent implements OnInit, OnDestroy {


      protected profile!: Observable<Profile>;
      protected currentRoute?: Routes;
      private routeSub!: Subscription;


      constructor(
              private authenticator: Authenticator,
              private profileService: ProfileService,
              private router: Router,
              private injector: Injector,
              private matDialog: MatDialog) {

            this.profile = this.profileService.getProfileObservable()

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
                                } else if (path === 'search') {
                                      this.currentRoute = Routes.SEARCH
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


      protected openCreateGroupDialog(): void {
            this.matDialog.open(CreateGroupDialogComponent, {
                  width: '420px',
                  maxWidth: '95vw',
                  injector: this.injector,
            });
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
