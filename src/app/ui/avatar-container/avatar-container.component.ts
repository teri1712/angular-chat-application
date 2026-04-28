import {Component, computed, effect, HostListener, inject, input, signal} from '@angular/core';
import {CommonModule, NgOptimizedImage} from "@angular/common";
import {MatBadgeModule} from "@angular/material/badge";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {Router} from "@angular/router";
import {DirectRepository} from "../../service/repository/chat-repository";
import {interval} from "rxjs";

@Component({
    selector: 'app-avatar-container',
    imports: [CommonModule, MatBadgeModule, MatButtonModule, MatIconModule, NgOptimizedImage],
    templateUrl: './avatar-container.component.html',
    styleUrl: './avatar-container.component.css'
})
export class AvatarContainerComponent {

    size = input.required<number>();
    presence = input<Date | undefined>();
    avatar = input<string | undefined>();
    name = input<string>();

    chatId = input<string | undefined>();
    direct = input<string | undefined>();

    private readonly currentTime = signal<Date>(new Date())
    private readonly timediff = computed(() => {
        const presence = this.presence() ?? new Date(0);
        return this.currentTime().getTime() / 1000 - presence.getTime() / 1000
    });

    showBadge = computed(() => {
        return this.timediff() >= 60 * 60
    })

    timeStatus = computed(() => {
        return this.timediff() > 60 ? Math.floor((this.timediff() + 59) / 60) : 0;
    })

    constructor() {
        effect((onCleanup) => {
            const sub = interval(60 * 1000).subscribe(() => {
                this.currentTime.set(new Date())
            })
            onCleanup(() => sub.unsubscribe())
        });
    }

    private router = inject(Router)
    private directRepository = inject(DirectRepository)

    @HostListener('click', [])
    onClick() {

        if (this.chatId()) {
            this.router.navigate(['/home', {
                    outlets: {
                        'conversation': [this.chatId()]
                    }
                }],

                {
                    queryParamsHandling: 'merge',
                    queryParams: {
                        roomName: this.name(),
                        roomAvatar: this.avatar()
                    }
                })
        }
        if (this.direct()) {
            this.directRepository.get(this.direct()!).subscribe(chatId => {
                this.router.navigate(['/home', {
                        outlets: {
                            'conversation': [chatId]
                        }
                    }],

                    {
                        queryParamsHandling: 'merge',
                        queryParams: {
                            roomName: this.name(),
                            roomAvatar: this.avatar()
                        }
                    })
            })
        }


    }

}
