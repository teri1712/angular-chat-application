import {Component} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {HttpErrorResponse} from "@angular/common/http";
import {environment} from "../../environments";
import {Authenticator} from "../../usecases/service/auth/authenticator";
import {Router} from "@angular/router";

@Component({
      selector: 'app-login',
      standalone: false,
      templateUrl: './login.component.html',
      styleUrl: './login.component.css',
})
export class LoginComponent {

      readonly oauth2_url = environment.API_URL + '/oauth2/authorization/google';

      constructor(
              private readonly authenticator: Authenticator,
              private router: Router,
      ) {
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
                    (error: HttpErrorResponse) => {
                          this.error = error.error
                    }
            )
      }
}
