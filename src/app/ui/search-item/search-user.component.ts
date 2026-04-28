import {Component, HostListener, input, output} from '@angular/core';
import {AvatarContainerComponent} from "../avatar-container/avatar-container.component";
import {User} from "../../model/dto/user";

@Component({
    selector: 'app-search-user',
    imports: [
        AvatarContainerComponent
    ],
    templateUrl: './search-user.component.html',
    styleUrl: './search-user.component.css'
})
export class SearchUserComponent {
    user = input.required<User>()
    selected = output<User>()
    protected readonly onlineAt = new Date(0);

    @HostListener('click', [])
    onClick() {
        const user = this.user()
        this.selected.emit(user);
    }
}
