import {Component, Injector, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {ONE_HOUR_SECONDS, ONE_MINUTE_SECONDS} from "../../utils/time";
import {CommonModule} from "@angular/common";
import {AvatarContainerComponent} from "../avatar-container/avatar-container.component";
import {MatIcon} from "@angular/material/icon";
import {ChatSettingComponent} from '../chat-setting/chat-setting.component';
import {MatIconButton} from "@angular/material/button";
import {SearchDialogComponent} from "../search-dialog/search-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {BehaviorSubject, filter, Observable, switchMap} from "rxjs";
import {Preference} from "../../model/dto/preference";
import {DialogService} from "../../service/repository/dialog.service";

@Component({
      selector: 'app-chat-info-bar',
      imports: [CommonModule, AvatarContainerComponent, MatIcon, ChatSettingComponent, MatIconButton],
      templateUrl: './chat-info-bar.component.html',
      styleUrl: './chat-info-bar.component.css',
      standalone: true
})
export class ChatInfoBarComponent implements OnChanges, OnInit {
      @Input({required: true}) roomName!: string | null;
      @Input({required: true}) roomAvatar!: string | null;

      @Input({required: true})
      set chatId(value: string | null) {
            if (value == null) return;
            this.chatIdSubject.next(value);
      };

      @Input({required: true}) presence!: Date | null;

      protected preference!: Observable<Preference>;
      protected chatIdSubject = new BehaviorSubject<string | null>(null);


      constructor(
              private matDialog: MatDialog,
              private dialogService: DialogService,
              private injector: Injector
      ) {
      }

      ngOnInit(): void {
            this.preference = this.chatIdSubject.pipe(
                    filter(chatId => chatId != null),
                    switchMap(chatId => this.dialogService.findByChatId(chatId)),
                    switchMap((dialog) => dialog.preference)
            )
      }

      ngOnChanges(changes: SimpleChanges): void {
            if (changes['chatId']) {
                  const chatId = changes['chatId'].currentValue;
                  this.chatIdSubject.next(chatId);
            }
      }


      protected get diffOnline(): number {
            return Date.now() / 1000 - (this.presence?.getTime() ?? 0) / 1000
      }

      protected openSearchDialog(chatId: string) {
            this.matDialog.open(SearchDialogComponent, {
                  width: '600px',
                  maxWidth: '90vw',
                  height: 'auto',
                  maxHeight: '85vh',
                  injector: this.injector,
                  data: {
                        chatId: chatId,
                  }
            });
      }

      protected readonly ONE_HOUR_SECONDS = ONE_HOUR_SECONDS;
      protected readonly ONE_MINUTE_SECONDS = ONE_MINUTE_SECONDS;
      protected readonly Math = Math;
}