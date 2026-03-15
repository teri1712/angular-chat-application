import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {HttpErrorResponse} from "@angular/common/http";
import {Authenticator} from "../../../service/auth/authenticator";
import {Router} from "@angular/router";
import {ThemeService} from "../../../service/theme-service";
import {Subscription} from "rxjs";

declare var google: any;

@Component({
      selector: 'app-login',
      standalone: false,
      templateUrl: './login.component.html',
      styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit, OnDestroy {

      private themeSubscription?: Subscription;

      constructor(
              private readonly authenticator: Authenticator,
              private readonly themeService: ThemeService,
              private router: Router,
      ) {
      }


      ngOnInit(): void {
            google.accounts.id.initialize({
                  client_id: "863552069596-2qbk9ci1jmdic6271pluqsd7snm11mof.apps.googleusercontent.com",
                  callback: (response: any) => {
                        this.onIdToken(response.credential);
                  }
            });

            this.themeSubscription = this.themeService.themeObservable.subscribe(() => {
                  this.renderGoogleButton();
            });
      }

      ngOnDestroy(): void {
            this.themeSubscription?.unsubscribe();
      }

      private renderGoogleButton(): void {
            const googleBtn = document.getElementById("google-btn");
            if (googleBtn) {
                  google.accounts.id.renderButton(
                          googleBtn,
                          {theme: this.themeService.theme ? "outline" : "filled_black", size: "large"}
                  );
            }
      }

      onIdToken(idToken: string) {
            this.authenticator.loginOAuth2(idToken).subscribe(
                    (user) => {
                          this.router.navigate(['/home']);
                    },
                    (error: HttpErrorResponse) => {
                          this.error = error.error
                    }
            )
      }

      form = new FormGroup({
            username: new FormControl<string>('', [Validators.required, Validators.minLength(4)]),
            password: new FormControl<string>('', [Validators.required, Validators.minLength(4)]),
      })
      inProgress = false;
      passwordVisibility = false
      error?: string
      usernameError?: string
      passwordError?: string

      updateUsernameError() {
            const control = this.form.get("username")!
            if (control.hasError('required')) {
                  this.usernameError = "Please fill up the field"
            } else if (control.hasError('minlength')) {
                  this.usernameError = "Username must have length of at least 4 characters"
            } else {
                  this.usernameError = undefined
            }
      }

      updatePasswordError() {
            const control = this.form.get("password")!
            if (control.hasError('required')) {
                  this.passwordError = "Please fill up the field"
            } else if (control.hasError('minlength')) {
                  this.passwordError = "Password must have length of at least 4 characters"
            } else {
                  this.passwordError = undefined
            }
      }

      onSubmit() {
            this.error = undefined;
            this.authenticator.signIn({
                  username: this.form.get("username")?.value as string,
                  password: this.form.get("password")?.value as string
            }).subscribe(
                    (user) => {
                          this.router.navigate(['/home']);
                    },
                    (error: Error) => {
                          this.error = error.message
                    }
            )
      }
}
