import {Account} from "../../../model/account";
import {SubscribableChannel} from "../event/subscribable-channel";
import {ChatEvent} from "../../../model/chat-event";
import {User} from "../../../model/user";
import {Injectable, OnDestroy} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {AccountRepository} from "./account-repository";
import {environment} from "../../../environments";
import {map, Observable, of, switchMap} from "rxjs";

@Injectable()
export class AccountManager implements OnDestroy {

      private readonly account: Account
      private readonly broadcastChannel: BroadcastChannel;
      private readonly channel: SubscribableChannel<ChatEvent>

      private eventSub = (event: MessageEvent<any>) => {
            this.emit(event.data as ChatEvent)
      }

      constructor(
              accountRepository: AccountRepository,
              private httpClient: HttpClient,
      ) {
            this.account = Account.from(accountRepository.account);
            this.broadcastChannel = new BroadcastChannel("MESSAGE_CHANNEL_" + this.account.id)
            this.channel = new SubscribableChannel()
            this.init()
      }

      private emit(event: ChatEvent) {
            event = ChatEvent.from(event)
            if (event.committed) {
                  const eventVersion = event.eventVersion!
                  if (this.eventVersion >= eventVersion) {
                        return;
                  } else if (this.eventVersion + 1 === eventVersion) {
                        this.eventVersion = eventVersion
                        this.channel.post(event)
                  } else {
                        this.resolveMissing(eventVersion)
                  }
            }
      }

      private download(atVersion: number): Observable<ChatEvent[]> {
            const params = new HttpParams()
                    .set("atVersion", atVersion);

            return this.httpClient.get<ChatEvent[]>(environment.API_URL + "/users/me/events", {
                  observe: 'body',
                  params: params
            }).pipe(
                    switchMap((events: ChatEvent[]) => {
                          const length = events.length
                          if (length === 0)
                                return of(events)
                          const lastVersion = events[length - 1].eventVersion!
                          if (lastVersion > this.eventVersion + 1) {
                                return this.download(lastVersion + 1).pipe(
                                        map((missing: ChatEvent[]) => {
                                              return [...events, ...missing]
                                        })
                                )
                          }
                          return of(events)
                    })
            )

      }

      private resolveMissing(caughtVersion: number) {
            this.download(caughtVersion).subscribe((events) => {
                  events.forEach((event: ChatEvent) => {
                        this.emit(event)
                  })
            })
      }

      private init(): void {
            this.broadcastChannel.addEventListener('message', this.eventSub)
      }

      get user(): User {
            return this.account.user;
      }

      get eventVersion(): number {
            return this.account.syncContext.eventVersion;
      }

      private set eventVersion(value: number) {
            this.account.syncContext.eventVersion = value;
      }

      get eventChannel(): SubscribableChannel<ChatEvent> {
            return this.channel;
      }

      ngOnDestroy(): void {
            this.broadcastChannel.removeEventListener('message', this.eventSub)
      }
}