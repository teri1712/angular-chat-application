import {Component} from '@angular/core';
import {provideNativeDateAdapter} from "@angular/material/core";
import {Router} from "@angular/router";
import {HttpErrorResponse} from "@angular/common/http";
import {MatDialog} from "@angular/material/dialog";
import {ProgressDialogComponent} from "../../progress-dialog/progress-dialog.component";
import {finalize, map, of, switchMap} from "rxjs";
import {Authenticator} from "../../../service/auth/authenticator";
import {UploadService} from "../../../service/upload-service";
import {ImageSpec} from "../../../model/dto/image-spec";

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
                  private matDialog: MatDialog,
                  private uploadService: UploadService) {
      }

      private readonly body: {
            username?: string,
            password?: string,
            fullname?: string,
            gender?: number,
            dob?: string,
            file?: File
      } = {}
      error?: string
      progress = 0

      protected onCompleteInformation(info: {
            username: string,
            password: string,
            fullname: string,
            gender: number,
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

            const avatarObs = this.body.file
                    ? this.uploadService.upload(this.body.file.name, this.body.file).pipe(
                            map((downloadUrl): ImageSpec => {
                                  return {
                                        uri: downloadUrl.path,
                                        filename: this.body.file!.name,
                                        width: 500,
                                        height: 500,
                                        format: this.body.file!.name.split('.').pop() || 'jpg'
                                  }
                            })
                    )
                    : of(null as ImageSpec | null);

            avatarObs.pipe(
                    switchMap((avatar: ImageSpec | null) => {
                          return this.authenticator.signUp({
                                username: this.body.username!,
                                password: this.body.password!,
                                gender: this.body.gender!,
                                dob: this.body.dob!,
                                name: this.body.fullname!,
                                avatar: avatar
                          });
                    }),
                    finalize(() => {
                          ref.close()
                    })
            ).subscribe(
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
