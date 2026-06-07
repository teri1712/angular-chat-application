import {Component, inject, signal} from '@angular/core';
import {provideNativeDateAdapter} from "@angular/material/core";
import {InfoForm} from "./sign-up.types";
import {Authenticator} from "../../../service/auth/authenticator";
import {Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {ProgressDialogComponent} from "../../progress-dialog/progress-dialog.component";
import {finalize} from "rxjs";


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

    info?: InfoForm
    avatar?: File

    readonly totalSteps = 2;
    readonly steps = signal(Array.from({length: this.totalSteps}, (_, i) => i + 1));
    readonly progress = signal<number>(1)
    readonly error = signal('')

    constructor() {
    }

    protected onCompleteInfo(info: InfoForm) {
        this.info = info
        this.progress.set(2)
    }

    protected onCompleteAvatar(avatar?: File) {
        this.avatar = avatar
        this.submit()
    }

    protected onBack() {
        this.progress.set(this.progress() - 1)
    }

    private submit() {
        if (!this.info) return;

        const ref = this.matDialog.open(ProgressDialogComponent, {
            panelClass: 'modern-dialog',
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
        ).subscribe({
            next: () => {
                this.router.navigate(['/home'])
            },
            error: err => {
                console.error(err)
                this.error.set(err.error?.detail)
            }
        })
    }
}
