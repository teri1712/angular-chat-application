import {filter, Observable, Subject} from "rxjs";
import {InboxLog} from "../../model/dto/inbox-log";
import {Injectable, OnDestroy} from "@angular/core";
import {AccountRepository} from "../auth/account-repository";

@Injectable()
export class LogStream implements OnDestroy {

      private readonly logChannel: Subject<InboxLog> = new Subject<InboxLog>();

      constructor(accountRepository: AccountRepository) {
            this.init()
      }

      ngOnDestroy(): void {
      }

      private init() {
      }

      public publish(log: InboxLog) {
            this.logChannel.next(log);
      }

      getChannel(): Observable<InboxLog> {
            return this.logChannel.asObservable()
      }

      getChatChannel(chatId: string): Observable<InboxLog> {
            return this.logChannel.asObservable().pipe(filter(log => log.chatId === chatId))
      }
}