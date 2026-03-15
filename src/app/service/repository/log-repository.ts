import {filter, Observable, Subject} from "rxjs";
import {InboxLog} from "../../model/dto/inbox-log";
import {Injectable, OnDestroy} from "@angular/core";
import {getGobalLogChannel} from "../event/commons";
import {AccountRepository} from "../auth/account-repository";

@Injectable()
export class LogRepository implements OnDestroy {

      private readonly globalLogChannel: BroadcastChannel;
      private readonly logChannel: Subject<InboxLog> = new Subject<InboxLog>();
      private readonly logSub = (message: MessageEvent<any>) => {
            const log = message.data as InboxLog;
            this.logChannel.next(log)
      }

      constructor(accountRepository: AccountRepository) {
            this.globalLogChannel = getGobalLogChannel(accountRepository.currentUser?.username!)
            this.init()
      }

      ngOnDestroy(): void {
            this.globalLogChannel.removeEventListener('message', this.logSub)
      }

      private init() {
            this.globalLogChannel.addEventListener('message', this.logSub)
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