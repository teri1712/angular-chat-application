import {Component, EventEmitter, Output} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";

@Component({
      selector: 'app-sign-up-info',
      standalone: false,

      templateUrl: './sign-up-info.component.html',
      styleUrl: './sign-up-info.component.css'
})
export class SignUpInfoComponent {

      formGroup = new FormGroup({
            username: new FormControl('Luffy', [Validators.required, Validators.minLength(4)]),
            fullname: new FormControl('Luffy', [Validators.required, Validators.minLength(4)]),
            password: new FormControl('dasdasdadasdaa', [Validators.required, Validators.minLength(4)]),
            gender: new FormControl('MALE'),
            dob: new FormControl(new Date()),
      })

      @Output() next = new EventEmitter<{
            username: string,
            password: string,
            fullname: string,
            gender: string,
            dob: string,
      }>();

      constructor() {
      }

      genders = ["MALE", "FEMALE", "OTHER"]
      passwordVisibility = false

      usernameError?: String
      fullnameError?: String
      passwordError?: String

      protected updateUsernameError() {
            const control = this.formGroup.get("username")!
            if (control.hasError('required')) {
                  this.usernameError = "Please fill up the field"
            } else if (control.hasError('minlength')) {
                  this.usernameError = "Username must have length of at least 4 characters"
            } else {
                  this.usernameError = undefined
            }
      }

      protected updateFullnameError() {
            const control = this.formGroup.get("fullname")!
            if (control.hasError('required')) {
                  this.fullnameError = "Please fill up the field"
            } else if (control.hasError('minlength')) {
                  this.fullnameError = "Full name must have length of at least 4 characters"
            } else {
                  this.fullnameError = undefined
            }
      }

      protected updatePasswordError() {
            const control = this.formGroup.get("password")!
            if (control.hasError('required')) {
                  this.passwordError = "Please fill up the field"
            } else if (control.hasError('minlength')) {
                  this.passwordError = "Password must have length of at least 4 characters"
            } else {
                  this.passwordError = undefined
            }
      }

      protected onSubmit() {
            this.next.emit({
                  username: this.formGroup.get("username")?.value!,
                  password: this.formGroup.get("password")?.value!,
                  fullname: this.formGroup.get("fullname")?.value!,
                  gender: this.formGroup.get("gender")?.value!,
                  dob: this.formGroup.get("dob")?.value?.toISOString().split('T')[0]!,
            })
      }

}
