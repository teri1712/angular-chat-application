import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LoginComponent} from './login/login.component';
import {RouterModule, Routes} from '@angular/router';
import {SignUpComponent} from './sign-up/sign-up.component';
import {ForgotPasswordComponent} from './forgot-password/forgot-password.component';
import {ReactiveFormsModule} from "@angular/forms";
import {SignUpInfoComponent} from './sign-up/sign-up-info/sign-up-info.component';
import {SignUpAvatarComponent} from './sign-up-avatar/sign-up-avatar.component';
import {ProgressDialogComponent} from "../progress-dialog/progress-dialog.component";

const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'sign-up',
        component: SignUpComponent,
    },
    {
        path: 'forgot-password',
        component: ForgotPasswordComponent,
    },
];

@NgModule({
    declarations: [LoginComponent, SignUpComponent, ForgotPasswordComponent, SignUpInfoComponent, SignUpAvatarComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        ReactiveFormsModule,
        ProgressDialogComponent
    ],
})
export class AuthModule {
}
