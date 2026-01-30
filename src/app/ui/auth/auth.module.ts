import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LoginComponent} from './login/login.component';
import {RouterModule, Routes} from '@angular/router';
import {SignUpComponent} from './sign-up/sign-up.component';
import {ForgotPasswordComponent} from './forgot-password/forgot-password.component';
import {ReactiveFormsModule} from "@angular/forms";
import {MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {MatCardModule} from "@angular/material/card";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatSelectModule} from "@angular/material/select";
import {SignUpInfoComponent} from './sign-up/sign-up-info/sign-up-info.component';
import {SignUpAvatarComponent} from './sign-up-avatar/sign-up-avatar.component';
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
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
            MatFormFieldModule,
            MatInputModule,
            MatButtonModule,
            MatIconModule,
            MatCardModule,
            MatDatepickerModule,
            MatSelectModule,
            MatProgressSpinnerModule,
            ProgressDialogComponent
      ],
      providers: [
            {provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {appearance: 'outline'}}
      ],
})
export class AuthModule {
}
