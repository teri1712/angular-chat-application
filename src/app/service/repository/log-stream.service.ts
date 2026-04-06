import {filter, Observable, Subject} from "rxjs";
import {InboxLog} from "../../model/dto/inbox-log";

export abstract class LogStream {

      private readonly logChannel: Subject<InboxLog> = new Subject<InboxLog>();

      protected publish(log: InboxLog) {
            this.logChannel.next(log);
      }

      getChannel(): Observable<InboxLog> {
            return this.logChannel.asObservable()
      }

      getChatChannel(chatId: string): Observable<InboxLog> {
            return this.logChannel.asObservable().pipe(filter(log => log.chatId === chatId))
      }
}