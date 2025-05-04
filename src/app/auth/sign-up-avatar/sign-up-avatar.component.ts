import {Component, EventEmitter, Output} from '@angular/core';

const DEFAULT_AVATAR = "/avatar-default.svg";

@Component({
      selector: 'app-sign-up-avatar',
      standalone: false,

      templateUrl: './sign-up-avatar.component.html',
      styleUrl: './sign-up-avatar.component.css'
})
export class SignUpAvatarComponent {

      @Output() submitAvatar = new EventEmitter<File | undefined>();

      private file?: File;
      protected uri: string = DEFAULT_AVATAR;

      protected onAvatarSelected(event: Event) {
            const files = (event.target as HTMLInputElement)?.files
            if (files?.length) {
                  this.file = files[0];
                  this.uri = URL.createObjectURL(this.file)
            }
      }

      protected onSubmit() {
            this.submitAvatar.emit(this.file);
      }
}
