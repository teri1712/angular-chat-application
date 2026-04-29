import {Component, effect, inject, Injector, OnDestroy, OnInit, signal} from '@angular/core';
import {ActivationEnd, Router} from "@angular/router";
import {ProgressDialogComponent} from "../progress-dialog/progress-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {filter, Subscription} from "rxjs";
import {Authenticator} from "../../service/auth/authenticator";
import {settingRoute, threadsRoute} from "../../home-route.module";
import ProfileService from "../../service/profile-service";
import {CreateGroupDialogComponent} from "../create-group-dialog/create-group-dialog.component";
import {MatSnackBar} from "@angular/material/snack-bar";

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


    private authenticator = inject(Authenticator)
    private profileService = inject(ProfileService)
    private router = inject(Router)
    private snackBar = inject(MatSnackBar)
    private injector = inject(Injector)
    private matDialog = inject(MatDialog)
    protected profile = this.profileService.profile
    protected currentRoute = signal<Routes>(Routes.THREAD);
    private routeSub!: Subscription;

    constructor() {
        effect(() => {
            if (!this.profile()) {
                const ref = this.snackBar.open("Account Session has expired!", "Logout");
                ref.onAction().subscribe(() => {
                    this.router.navigate(["/auth/login"], {replaceUrl: true});
                });
            }
        });


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
                        this.currentRoute.set(Routes.THREAD)
                    } else if (path === 'settings') {
                        this.currentRoute.set(Routes.SETTINGS)
                    } else if (path === 'search') {
                        this.currentRoute.set(Routes.SEARCH)
                    }
                }
            });
        this.navigateToThreads()
    }

    ngOnDestroy(): void {
        this.routeSub.unsubscribe();
    }

    protected navigateToSettings() {
        this.router.navigate(settingRoute);
    }

    protected navigateToThreads() {
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
                    this.router.navigate(["/auth/login"], {replaceUrl: true});
                }
                ref.close();
            }
        );
    }

    protected readonly Routes = Routes;
}
