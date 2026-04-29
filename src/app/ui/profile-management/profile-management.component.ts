import {Component, computed, effect, inject} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
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
import {rxResource} from "@angular/core/rxjs-interop";
import {MatProgressSpinner} from "@angular/material/progress-spinner";

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
        MatDatepickerModule,
        MatProgressSpinner
    ],
    templateUrl: './profile-management.component.html',
    styleUrls: ['./profile-management.component.css']
})
export class ProfileManagementComponent {
    profileForm!: FormGroup;
    passwordForm!: FormGroup;
    private initialProfileValues: any = {};

    private fb = inject(FormBuilder)
    private profileService = inject(ProfileService)
    private authenticator = inject(Authenticator)
    private snackBar = inject(MatSnackBar)
    public dialogRef = inject(MatDialogRef<ProfileManagementComponent>)

    profile = rxResource({
        params: () => {
            return ({})
        },
        stream: (request) => {
            return this.profileService.refresh()
        },
    });

    avatarPreview = computed(() => {
        const profile = this.profile.value()
        return profile?.avatar
    });

    constructor() {
        effect(() => {
            const profile = this.profile.value()
            if (profile) {

                this.profileForm = this.fb.group({
                    username: [profile.username || '', [Validators.required]],
                    name: [profile.name || '', [Validators.required]],
                    gender: [profile.gender || 'Male', [Validators.required]],
                    dob: [profile.dob ? new Date(profile.dob) : new Date()]
                });

                this.initialProfileValues = this.profileForm.getRawValue();

                this.passwordForm = this.fb.group({
                    oldPassword: ['', [Validators.required]],
                    newPassword: ['', [Validators.required, Validators.minLength(6)]],
                    confirmPassword: ['', [Validators.required]]
                }, {validator: this.passwordMatchValidator});
            }
        });
    }


    passwordMatchValidator(g: FormGroup) {
        return g.get('newPassword')?.value === g.get('confirmPassword')?.value
            ? null : {'mismatch': true};
    }

    onProfileSubmit(): void {
        if (this.profileForm.valid) {
            const formValue = {...this.profileForm.value};
            const changedFields: any = {};

            for (const key of Object.keys(formValue)) {
                const current = formValue[key];
                const initial = this.initialProfileValues[key];
                const currentStr = current instanceof Date ? current.toISOString().split('T')[0] : current;
                const initialStr = initial instanceof Date ? initial.toISOString().split('T')[0] : initial;
                if (currentStr !== initialStr) {
                    changedFields[key] = current;
                }
            }

            if (Object.keys(changedFields).length === 0) {
                this.snackBar.open('No changes to save', 'Close', {duration: 3000});
                return;
            }

            if (changedFields.dob instanceof Date) {
                changedFields.dob = changedFields.dob.toISOString().split('T')[0];
            }
            if (changedFields.gender) {
                let gender = 0;
                switch (changedFields.gender.toLowerCase()) {
                    case "male":
                        gender = 1;
                        break;
                    case "female":
                        gender = 2;
                        break;
                    default:
                        gender = 3;
                        break;
                }
                changedFields.gender = gender;
            }
            this.profileService.updateProfile(changedFields).subscribe({
                next: (updatedUser) => {
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
                    this.snackBar.open('Avatar updated successfully', 'Close', {duration: 3000});
                },
                error: (err) => {
                    this.snackBar.open('Failed to update avatar', 'Close', {duration: 3000});
                }
            });
        }
    }
}
