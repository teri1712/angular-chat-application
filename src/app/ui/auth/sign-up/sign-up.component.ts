import {Component, inject, signal} from '@angular/core';
import {provideNativeDateAdapter} from "@angular/material/core";
import {Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {ProgressDialogComponent} from "../../progress-dialog/progress-dialog.component";
import {finalize} from "rxjs";
import {Authenticator} from "../../../service/auth/authenticator";
import {InfoForm} from "./sign-up-info/sign-up-info.component";


@Component({
    selector: 'app-sign-up',
    standalone: false,
    providers: [provideNativeDateAdapter()],
    templateUrl: './sign-up.component.html',
    styleUrl: './sign-up.component.css'
})
export class SignUpComponent {
    private readonly authenticator = inject(Authenticator)
    private readonly router = inject(Router)
    private readonly matDialog = inject(MatDialog)

    private info!: InfoForm
    private avatar?: File

    readonly error = signal('')
    readonly progress = signal<'info' | 'avatar'>('info')

    protected onCompleteInfo(info: InfoForm) {
        this.progress.set('avatar')
        this.info = info
    }

    protected onCompleteAvatar(avatar?: File) {
        this.avatar = avatar
        this.submit()
    }

    private submit() {
        const ref = this.matDialog.open(ProgressDialogComponent, {
            disableClose: true,
            data: {
                action_name: "Signing Up",
            }
        })


        this.authenticator.signUp({
            username: this.info.username,
            password: this.info.password,
            gender: this.info.gender,
            dob: new Date(this.info.dob).toISOString(),
            name: this.info.fullname,
            avatar: this.avatar
        }).pipe(
            finalize(() => {
                ref.close()
            })
        ).subscribe(
            {
                next: () => {

                    this.router.navigate(['/home'])
                },
                error: err => {
                    console.error(err)
                    this.error.set(err.error?.detail)
                }
            }
        )
    }
}
