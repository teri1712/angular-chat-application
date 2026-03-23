import {Component, DestroyRef, HostListener, inject, Input, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {MatBadgeModule} from "@angular/material/badge";
import {CommonModule} from "@angular/common";
import {AvatarContainerComponent} from "../avatar-container/avatar-container.component";
import ProfileService from "../../service/profile-service";
import {User} from "../../model/dto/user";
import {combineLatest, map, Observable, of, switchMap} from "rxjs";
import {DialogService} from "../../service/repository/dialog.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {MessageState} from "../../model/dto/message-state";
import {TextState} from "../../model/dto/text-state";

@Component({
      selector: 'app-conversation',
      imports: [CommonModule, AvatarContainerComponent, MatBadgeModule, MatButtonModule, MatIconModule],
      templateUrl: './conversation.component.html',
      styleUrl: './conversation.component.css'
})
export class ConversationComponent implements OnInit {

      @Input() identifier!: string;
      @Input() roomName!: string;
      @Input() roomAvatar!: string;
      @Input() newest!: MessageState
      @Input() sender!: User;
      @Input() seenBy!: User[]
      @Input() initialPresence!: Date

      protected presence!: Observable<Date>;

      protected get nameWeight(): string {
            return !this.seenByMe() && !this.mine() ? 'bold' : '500'
      }

      protected get contentWeight(): string {
            return !this.seenByMe() && !this.mine() ? 'bold' : 'normal'
      }

      mine() {
            return this.profileService.thatsMe(this.sender)
      }

      seenByMe() {
            return this.seenBy.some(user => this.profileService.thatsMe(user))
      }

      protected get displaySeenBy(): User[] {
            return this.seenBy.filter(user => !this.profileService.thatsMe(user))
      }

      constructor(private router: Router, private profileService: ProfileService, readonly dialogService: DialogService) {
      }

      ngOnInit(): void {
            this.presence = combineLatest([
                  of(this.initialPresence),
                  this.dialogService.findByChatId(this.identifier)
                          .pipe(takeUntilDestroyed(this.destroyRef),
                                  switchMap(dialog => dialog.presence),
                          )
            ]).pipe(map(([initial, presence]) => {
                  return presence ?? initial
            }))
      }

      private destroyRef = inject(DestroyRef);


      @HostListener('click')
      onClick() {
            this.router.navigate(['/home', {
                          outlets: {
                                'conversation': [this.identifier]
                          },
                    }],
                    {
                          queryParamsHandling: 'merge',
                          queryParams: {
                                roomName: this.roomName,
                                roomAvatar: this.roomAvatar,
                                presence: this.initialPresence.toString()
                          }
                    })
      }

      protected getPreview(messageState: MessageState): string {

            const prefix = this.profileService.thatsMe(messageState.sender) ? "You " : "";
            let content = "Wtf";

            switch (messageState.messageType.toLowerCase()) {
                  case "text":
                        content = (messageState as TextState).content;
                        break;

                  case "image":
                        content = "has sent an image";
                        break;

                  case "icon":
                        content = "has sent an icon";
                        break;

                  case "preference":
                        content = "has updated preferences";
                        break;

                  case "file":
                        content = "has sent a file";
                        break;

                  default:
                        break;
            }

            return prefix + content;

      }
}
