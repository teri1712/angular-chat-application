import {Component, output, signal} from '@angular/core';

const DEFAULT_AVATAR = "/avatar-default.svg";

@Component({
    selector: 'app-sign-up-avatar',
    standalone: false,

    templateUrl: './sign-up-avatar.component.html',
    styleUrl: './sign-up-avatar.component.css'
})
export class SignUpAvatarComponent {

    next = output<File | undefined>();

    private file?: File;
    readonly preview = signal(DEFAULT_AVATAR);

    protected onAvatarSelected(event: Event) {
        const files = (event.target as HTMLInputElement)?.files
        if (files?.length) {
            this.file = files[0];
            this.preview.set(URL.createObjectURL(this.file))
        }
    }

    protected onSubmit() {
        this.next.emit(this.file);
    }
}
