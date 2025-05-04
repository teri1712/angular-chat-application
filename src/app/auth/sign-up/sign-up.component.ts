import {Component} from '@angular/core';
import {provideNativeDateAdapter} from "@angular/material/core";
import {Router} from "@angular/router";
import {HttpErrorResponse} from "@angular/common/http";
import {MatDialog} from "@angular/material/dialog";
import {ProgressDialogComponent} from "../../progress-dialog/progress-dialog.component";
import {finalize} from "rxjs";
import {Authenticator} from "../../core/service/auth/authenticator";

@Component({
      selector: 'app-sign-up',
      standalone: false,
      providers: [provideNativeDateAdapter()],
      templateUrl: './sign-up.component.html',
      styleUrl: './sign-up.component.css'
})
export class SignUpComponent {

      constructor(private authenticator: Authenticator,
                  private router: Router,
                  private matDialog: MatDialog) {
      }

      private readonly body: {
            username?: string,
            password?: string,
            fullname?: string,
            gender?: string,
            dob?: string,
            file?: File
      } = {}
      error?: string
      progress = 0

      protected onCompleteInformation(info: {
            username: string,
            password: string,
            fullname: string,
            gender: string,
            dob: string,
      }) {
            this.progress = this.progress ^ 1
            this.body.username = info.username
            this.body.password = info.password
            this.body.fullname = info.fullname
            this.body.dob = info.dob
            this.body.gender = info.gender
      }

      protected onCompleteAvatar(file: File | undefined) {
            this.body.file = file
            this.submit()
      }

      private submit() {
            const ref = this.matDialog.open(ProgressDialogComponent, {
                  disableClose: true,
                  data: {
                        action_name: "Signing Up",
                  }
            })
            console.log(this.body)
            this.authenticator.signUp({
                  username: this.body.username!,
                  password: this.body.password!,
                  gender: this.body.gender!,
                  dob: this.body.dob!,
                  name: this.body.fullname!,
                  file: this.body.file
            }).pipe(finalize(() => {
                  ref.close()
            })).subscribe(
                    (response) => {
                          this.router.navigate(['/home']);
                    },
                    (error: HttpErrorResponse) => {
                          console.error(error)
                          this.error = error.error.toString()
                          this.progress = 0
                    },
            )
      }
}
