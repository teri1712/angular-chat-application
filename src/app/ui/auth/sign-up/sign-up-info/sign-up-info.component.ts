import {Component, output, signal} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";

export type InfoForm = {
    username: string,
    password: string,
    fullname: string,
    gender: number,
    dob: string,
}

@Component({
    selector: 'app-sign-up-info',
    standalone: false,

    templateUrl: './sign-up-info.component.html',
    styleUrl: './sign-up-info.component.css'
})
export class SignUpInfoComponent {

    formGroup = new FormGroup({
        username: new FormControl('', [Validators.required, Validators.minLength(4)]),
        fullname: new FormControl('', [Validators.required, Validators.minLength(4)]),
        password: new FormControl('', [Validators.required, Validators.minLength(4)]),
        gender: new FormControl(1),
        dob: new FormControl(new Date().toISOString().split('T')[0]),
    })

    next = output<InfoForm>()

    constructor() {
    }

    readonly genderOptions = [
        {value: 1, label: "Male"},
        {value: 2, label: "Female"},
        {value: 3, label: "Other"}
    ]
    passwordVisibility = signal(false)

    togglePassword() {
        this.passwordVisibility.set(!this.passwordVisibility())
    }

    protected onSubmit() {
        const dobValue = this.formGroup.get("dob")?.value;
        const dob = (dobValue as any) instanceof Date 
            ? (dobValue as any).toISOString().split('T')[0] 
            : dobValue;

        this.next.emit({
            username: this.formGroup.get("username")?.value!,
            password: this.formGroup.get("password")?.value!,
            fullname: this.formGroup.get("fullname")?.value!,
            gender: Number(this.formGroup.get("gender")?.value!),
            dob: dob!,
        })
    }

}
