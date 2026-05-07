import {AfterViewInit, Component, DestroyRef, effect, inject, NgZone, OnInit, signal} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {HttpErrorResponse} from "@angular/common/http";
import {Authenticator} from "../../../service/auth/authenticator";
import {Router} from "@angular/router";
import {ThemeService} from "../../../service/theme-service";
import {timer} from "rxjs";
import {ITokenStore} from "../../../service/auth/token-store.interface";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {environment} from "../../../environments";

declare var google: any;

@Component({
    selector: 'app-login',
    standalone: false,
    templateUrl: './login.component.html',
    styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit, AfterViewInit {

    private readonly authenticator = inject(Authenticator)
    private readonly themeService = inject(ThemeService)
    private tokenStore = inject(ITokenStore)
    private router = inject(Router)

    constructor() {
        effect(() => {
            if (this.tokenStore.isLoggedIn()) {
                timer(1).subscribe({
                    next: value => {
                        this.router.navigate(['/home']);
                    }
                })
            }
        });
    }


    ngOnInit(): void {
    }

    protected readonly googleScriptReady = signal(false);
    protected readonly isGoogleLoading = signal(false);

    private googleButtonSeed = false;
    private destroyRef = inject(DestroyRef);
    private ngZone = inject(NgZone)

    ngAfterViewInit(): void {
        this.googleButtonSeed = true;
        timer(0, 200)
            .pipe(
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe(() => {
                if (this.googleButtonSeed) {
                    if ((window as any).google) {
                        this.googleScriptReady.set(true);
                        this.initGoogleSignIn();
                        this.googleButtonSeed = false;
                    }
                }
            })
    }

    private initGoogleSignIn(): void {
        const g = (window as any).google;
        g.accounts.id.initialize({
            client_id: environment.googleClientId,
            callback: (response: { credential: string }) => {
                this.ngZone.run(() => this.handleGoogleCredential(response.credential));
            },
            auto_select: false,
        });

        const btn = document.getElementById('google-signin-btn');
        if (btn) {
            g.accounts.id.renderButton(btn, {
                theme: 'outline',
                size: 'large',
                width: btn.offsetWidth || 360,
                text: 'signin_with',
                shape: 'rectangular',
                logo_alignment: 'left',
            });
        }
    }

    private handleGoogleCredential(idToken: string): void {
        this.isGoogleLoading.set(true);

        this.authenticator.loginOAuth2(idToken).subscribe({
            next: () => this.router.navigate(['/docs/dashboard']),
            error: (err: HttpErrorResponse) => {
                this.isGoogleLoading.set(false);
                this.error.set(err.error?.detail);
            },
        });
    }


    form = new FormGroup({
        username: new FormControl<string>('', [Validators.required, Validators.minLength(4)]),
        password: new FormControl<string>('', [Validators.required, Validators.minLength(4)]),
    })
    inProgress = signal(false);
    passwordVisibility = signal(false)
    error = signal('')
    usernameError = signal('')
    passwordError = signal('')

    updateUsernameError() {
        const control = this.form.get("username")!
        if (control.hasError('required')) {
            this.usernameError.set("Please fill up the field")
        } else if (control.hasError('minlength')) {
            this.usernameError.set("Username must have length of at least 4 characters")
        } else {
            this.usernameError.set('')
        }
    }

    updatePasswordError() {
        const control = this.form.get("password")!
        if (control.hasError('required')) {
            this.passwordError.set("Please fill up the field")
        } else if (control.hasError('minlength')) {
            this.passwordError.set("Password must have length of at least 4 characters")
        } else {
            this.passwordError.set('')
        }
    }

    togglePassword() {
        this.passwordVisibility.set(!this.passwordVisibility())
    }

    onSubmit() {
        this.form.markAllAsTouched();
        this.updateUsernameError();
        this.updatePasswordError();
        if (this.form.invalid) return;

        this.error.set('');
        this.authenticator.signIn({
            username: this.form.get("username")?.value as string,
            password: this.form.get("password")?.value as string
        }).subscribe(
            {
                error: err => {
                    this.error.set(err.error?.detail)
                }
            }
        )
    }
}
