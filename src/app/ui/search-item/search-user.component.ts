import {Component, HostListener, inject, input, output} from '@angular/core';
import {AvatarContainerComponent} from "../avatar-container/avatar-container.component";
import {User} from "../../model/dto/user";
import {Router} from "@angular/router";
import {DirectRepository} from "../../service/repository/chat-repository";

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
    router = inject(Router)
    directRepository = inject(DirectRepository)
    protected readonly onlineAt = new Date(0);

    @HostListener('click', [])
    onClick() {
        const user = this.user()
        this.selected.emit(user);
        this.directRepository.get(user.id).subscribe(
            {
                next: chatId => {
                    this.router.navigate(['/home', {
                            outlets: {
                                'conversation': [chatId]
                            }
                        }],
                        {
                            queryParamsHandling: 'merge',
                            queryParams: {
                                roomName: user.name,
                                roomAvatar: user.avatar
                            }
                        })
                }
            }
        )
    }
}
