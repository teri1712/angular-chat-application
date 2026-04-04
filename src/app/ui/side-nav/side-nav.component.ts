import {Component, DestroyRef, inject, Injector, OnDestroy, OnInit} from '@angular/core';
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
import {AccountRepository} from "../../service/auth/account-repository";
import {MatSnackBar} from "@angular/material/snack-bar";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

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
      private logoutRequest = false;

      constructor(
              private accountRepository: AccountRepository,
              private authenticator: Authenticator,
              private profileService: ProfileService,
              private router: Router, private readonly snackBar: MatSnackBar,
              private injector: Injector,
              private matDialog: MatDialog) {
            this.profile = this.profileService.getProfileObservable()

      }

      private destroyRef = inject(DestroyRef);

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
            this.accountRepository.accountObservable
                    .pipe(takeUntilDestroyed(this.destroyRef))
                    .subscribe(account => {
                          if (account)
                                return
                          if (this.logoutRequest) {
                                this.router.navigate(["/auth/login"], {replaceUrl: true});
                          } else {
                                const ref = this.snackBar.open("Account Session has expired!", "Logout");
                                ref.onAction().subscribe(() => {
                                      this.router.navigate(["/auth/login"], {replaceUrl: true});
                                });
                          }
                    })
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
            this.logoutRequest = true;
            this.authenticator.logout().subscribe(
                    (success) => {
                          if (success) {
                          }
                          ref.close();
                    }
            );
      }

      protected readonly Routes = Routes;
      protected readonly environment = environment;
}
