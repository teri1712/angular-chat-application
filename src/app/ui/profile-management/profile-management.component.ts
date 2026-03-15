import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Profile} from '../../model/dto/profile';
import {CommonModule} from '@angular/common';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatSelectModule} from '@angular/material/select';
import {MatIconModule} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {provideNativeDateAdapter} from '@angular/material/core';
import ProfileService from "../../service/profile-service";
import {Authenticator} from "../../service/auth/authenticator";

@Component({
      selector: 'app-profile-management',
      standalone: true,
      providers: [provideNativeDateAdapter()],
      imports: [
            CommonModule,
            ReactiveFormsModule,
            MatFormFieldModule,
            MatInputModule,
            MatButtonModule,
            MatSelectModule,
            MatIconModule,
            MatCardModule,
            MatSnackBarModule,
            MatDialogModule,
            MatDatepickerModule
      ],
      templateUrl: './profile-management.component.html',
      styleUrls: ['./profile-management.component.css']
})
export class ProfileManagementComponent implements OnInit {
      profileForm!: FormGroup;
      passwordForm!: FormGroup;
      profile!: Profile;
      avatarPreview: string | null = null;

      constructor(
              private fb: FormBuilder,
              private profileService: ProfileService,
              private authenticator: Authenticator,
              private snackBar: MatSnackBar,
              public dialogRef: MatDialogRef<ProfileManagementComponent>
      ) {
      }

      ngOnInit(): void {
            this.profile = this.profileService.getProfile();
            this.initForms();
            if (this.profile.avatar) {
                  this.avatarPreview = this.profile.avatar;
            }
      }

      initForms(): void {
            this.profileForm = this.fb.group({
                  username: [this.profile.username || '', [Validators.required]],
                  name: [this.profile.name || '', [Validators.required]],
                  gender: [this.profile.gender || 1, [Validators.required]],
                  dob: [this.profile.dob ? new Date(this.profile.dob) : new Date()]
            });

            this.passwordForm = this.fb.group({
                  oldPassword: ['', [Validators.required]],
                  newPassword: ['', [Validators.required, Validators.minLength(6)]],
                  confirmPassword: ['', [Validators.required]]
            }, {validator: this.passwordMatchValidator});
      }

      passwordMatchValidator(g: FormGroup) {
            return g.get('newPassword')?.value === g.get('confirmPassword')?.value
                    ? null : {'mismatch': true};
      }

      onProfileSubmit(): void {
            if (this.profileForm.valid) {
                  const formValue = {...this.profileForm.value};
                  if (formValue.dob instanceof Date) {
                        formValue.dob = formValue.dob.toISOString().split('T')[0];
                  }
                  this.profileService.updateProfile(formValue).subscribe({
                        next: (updatedUser) => {
                              this.profile = updatedUser;
                              this.snackBar.open('Profile updated successfully', 'Close', {duration: 3000});
                        },
                        error: (err) => {
                              this.snackBar.open('Failed to update profile', 'Close', {duration: 3000});
                        }
                  });
            }
      }

      onPasswordSubmit(): void {
            if (this.passwordForm.valid) {
                  const {oldPassword, newPassword} = this.passwordForm.value;
                  this.authenticator.changePassword(oldPassword, newPassword).subscribe({
                        next: () => {
                              this.snackBar.open('Password changed successfully', 'Close', {duration: 3000});
                              this.passwordForm.reset();
                        },
                        error: (err) => {
                              this.snackBar.open('Failed to change password', 'Close', {duration: 3000});
                        }
                  });
            }
      }

      onFileSelected(event: any): void {
            const file: File = event.target.files[0];
            if (file) {
                  const reader = new FileReader();
                  reader.onload = (e: any) => {
                        this.avatarPreview = e.target.result;
                  };
                  reader.readAsDataURL(file);

                  this.profileService.updateAvatar(file).subscribe({
                        next: (updatedUser) => {
                              this.profile = updatedUser;
                              this.snackBar.open('Avatar updated successfully', 'Close', {duration: 3000});
                        },
                        error: (err) => {
                              this.snackBar.open('Failed to update avatar', 'Close', {duration: 3000});
                        }
                  });
            }
      }
}
