import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CdkVirtualScrollViewport, ScrollingModule} from "@angular/cdk/scrolling";
import {CommonModule} from "@angular/common";
import {DialogComponent} from "../dialog/dialog.component";
import {IDialog} from "../../model/IDialog";
import {union} from "../../utils/array";
import {ChatEvent, getConversation, isPendingEvent} from "../../model/dto/chat-event";
import {DialogRepository} from "../../service/repository/dialog-repository";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {Subscription, tap} from "rxjs";
import {AccountRepository} from "../../service/auth/account-repository";
import {RealtimeClient} from "../../service/websocket/realtime-client.service";

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

      private dialogs: IDialog[] = [];
      private actual: IDialog[] = [];

      protected end: boolean = false;
      protected expanding: boolean = false;


      private eventSub!: Subscription;
      private eventObserver = (event: ChatEvent) => {

            if (event.message) {
                  const conversation = getConversation(event);
                  const dialog = this.repository.findAndSync(conversation)
                  this.remove(dialog, !isPendingEvent(event))
                  this.prepend(dialog, !isPendingEvent(event))
            }
      }

      constructor(private readonly repository: DialogRepository, accountRepository: AccountRepository, private readonly realtimeClient: RealtimeClient) {
      }

      ngOnDestroy(): void {
            this.eventSub.unsubscribe()
      }

      ngOnInit(): void {
            this.eventSub = this.realtimeClient.getEventChannel().subscribe(this.eventObserver)
            this.expand()
      }

      protected get dialogList(): DialogRow[] {
            const list = this.dialogs.map((dialog) =>
                    ({type: 'dialog', dialog: dialog} as DialogRow));
            if (this.expanding) list.push({type: 'loading'})
            return list
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

      private append(list: IDialog[]) {
            this.dialogs = union(this.dialogs, list);
            this.actual = union(this.actual, list);
            this.expandIfNecessary()
      }

      private prepend(dialog: IDialog, real: boolean) {
            this.dialogs.unshift(dialog);
            if (real) {
                  this.actual.unshift(dialog)
            }
      }

      private remove(dialog: IDialog, real: boolean) {
            this.dialogs = this.dialogs.filter((d) => !d.equals(dialog));
            if (real) {
                  this.actual = this.actual.filter((d) => !d.equals(dialog));
            }
      }
}


type DialogRow =
        | { type: 'loading' }
        | { type: 'dialog'; dialog: IDialog }
