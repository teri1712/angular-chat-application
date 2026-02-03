import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CdkVirtualScrollViewport, ScrollingModule} from "@angular/cdk/scrolling";
import {CommonModule} from "@angular/common";
import {DialogComponent} from "../dialog/dialog.component";
import {IDialog} from "../../model/IDialog";
import {ChatEvent, getConversation, isPendingEvent} from "../../model/dto/chat-event";
import {DialogRepository} from "../../service/repository/dialog-repository";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {finalize, Observable, Subscription} from "rxjs";
import {AccountRepository} from "../../service/auth/account-repository";
import {RealtimeClient} from "../../service/websocket/realtime-client.service";
import Expander from "../expander/expander";

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
export class DialogListComponent implements OnInit, OnDestroy, Expander<IDialog> {

      @ViewChild('viewport') viewport!: CdkVirtualScrollViewport;

      protected expandIfNecessary() {
            const range = this.viewport.getRenderedRange();
            const lastVisible = range.end - 1;

            if (lastVisible < this.renderedLength() - 5)
                  return
            if (this.expanding || this.isEnd())
                  return;

            this.expanding = true;
            this.expand().pipe(finalize(() => {
                  setTimeout(() => {
                        this.expanding = false;
                        this.expandIfNecessary()
                  }, 200)
            })).subscribe(dList => {
                          if (dList.length == 0) {
                                this.end = true;
                          } else {
                                this.append(dList)
                          }
                    },
                    error => {
                          console.error(error);
                    },
            )
      }

      private dialogs: IDialog[] = [];
      private reals: IDialog[] = [];

      protected end: boolean = false;
      protected expanding: boolean = false;


      private eventSub!: Subscription;
      private eventObserver = (event: ChatEvent) => {

            if (event.message) {
                  const dialog = this.repository.findAndSync(getConversation(event))
                  this.remove(dialog, !isPendingEvent(event))
                  this.prepend(dialog, !isPendingEvent(event))
            }
      }

      constructor(private readonly repository: DialogRepository, accountRepository: AccountRepository, private readonly realtimeClient: RealtimeClient) {
      }

      expand(): Observable<IDialog[]> {
            const length = this.reals.length;
            return length == 0 ?
                    this.repository.list() :
                    this.repository.list(this.reals[length - 1].conversation)


      }

      renderedLength(): number {
            return this.dialogs.length;
      }

      isEnd(): boolean {
            return this.end;
      }

      ngOnDestroy(): void {
            this.eventSub.unsubscribe()
      }

      ngOnInit(): void {
            this.eventSub = this.realtimeClient.getEventChannel().subscribe(this.eventObserver)
            this.expandIfNecessary()
      }

      protected get dialogList(): DialogRow[] {
            const list = this.dialogs.map((dialog) =>
                    ({type: 'dialog', dialog: dialog} as DialogRow));
            if (this.expanding) list.push({type: 'loading'})
            return list
      }


      protected trackBy(index: number, item: DialogRow) {
            switch (item.type) {
                  case 'loading':
                        return '0';
                  default:
                        return item.dialog
            }
      }


      private append(list: IDialog[]) {
            this.reals.push(...list);
            this.dialogs = this.union(this.dialogs, list);
      }

      private union(left: IDialog[], right: IDialog[]): IDialog[] {
            return [...left, ...right.filter(r => !left.find((l) => l === r))];
      }

      private prepend(dialog: IDialog, real: boolean) {
            this.dialogs.unshift(dialog);
            if (real) {
                  this.reals.unshift(dialog)
            }
      }

      private remove(dialog: IDialog, real: boolean) {
            this.dialogs = this.dialogs.filter((d) => d != dialog);
            if (real) {
                  this.reals = this.reals.filter((d) => d != dialog);
            }
      }
}


type DialogRow =
        | { type: 'loading' }
        | { type: 'dialog'; dialog: IDialog }