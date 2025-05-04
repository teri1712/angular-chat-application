import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CdkVirtualScrollViewport, ScrollingModule} from "@angular/cdk/scrolling";
import {CommonModule} from "@angular/common";
import {DialogComponent} from "../dialog/dialog.component";
import {Dialog} from "../model/dialog";
import {union} from "../core/utils/array";
import {ChannelSubscriber} from "../core/service/event/subscribable-channel";
import {ChatEvent} from "../model/chat-event";
import {DialogRepository} from "../core/service/repository/dialog-repository";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {isDialog, isLoading} from "../core/utils/item-type-check";
import {tap} from "rxjs";
import {AccountManager} from "../core/service/auth/account-manager";

@Component({
      selector: 'app-dialog-list',
      imports: [
            ScrollingModule,
            CommonModule,
            DialogComponent,
            MatProgressSpinner,
      ],
      templateUrl: './dialog-list.component.html',
      styleUrl: './dialog-list.component.css'
})
export class DialogListComponent implements OnInit, OnDestroy {
      @ViewChild('viewport') viewport!: CdkVirtualScrollViewport;

      protected expandIfNecessary() {
            const range = this.viewport.getRenderedRange();
            const lastVisible = range.end - 1;

            if (lastVisible >= this.dialogs.length - 5) {
                  this.expand()
            }
      }

      private dialogs: Dialog[] = [];
      private actual: Dialog[] = [];

      protected end: boolean = false;
      protected expanding: boolean = false;
      private sub: ChannelSubscriber<ChatEvent> = (event) => {
            if (event.isMessage()) {
                  event = ChatEvent.from(event)
                  const conversation = event.conversation
                  const dialog = this.repository.get(conversation)
                  this.remove(dialog, event.committed)
                  this.prepend(dialog, event.committed)
            }
      }

      constructor(private readonly repository: DialogRepository,
                  private accountManager: AccountManager) {
      }

      ngOnDestroy(): void {
            this.accountManager.eventChannel.unsubscribe(this.sub)
      }

      ngOnInit(): void {
            this.accountManager.eventChannel.subscribe(this.sub)
            this.expand()
      }

      protected get dialogList(): (Dialog | Boolean)[] {
            return [...this.dialogs, new Boolean(this.expanding)]
      }

      protected expand() {
            if (!this.expanding && !this.end) {
                  this.expanding = true;
                  const res = this.actual.length == 0 ?
                          this.repository.list() :
                          this.repository.list(this.actual[this.actual.length - 1].conversation)
                  res.pipe(tap(() => {
                        this.expanding = false;
                  })).subscribe(array => {
                                if (array.length == 0) {
                                      this.end = true;
                                } else {
                                      this.append(array)
                                }
                          },
                          error => {
                                console.error(error);
                          },
                  )
            }
      }

      private append(list: Dialog[]) {
            this.dialogs = union(this.dialogs, list);
            this.actual = union(this.actual, list);
            this.expandIfNecessary()
      }

      private prepend(dialog: Dialog, committed: boolean) {
            this.dialogs.unshift(dialog);
            if (committed) {
                  this.actual.unshift(dialog)
            }
      }

      private remove(dialog: Dialog, committed: boolean) {
            this.dialogs = this.dialogs.filter((d) => !d.equals(dialog));
            if (committed) {
                  this.actual = this.actual.filter((d) => !d.equals(dialog));
            }
      }

      protected readonly isLoading = isLoading;
      protected readonly isDialog = isDialog;
}
