import {Injectable, OnDestroy} from "@angular/core";
import {Client, Frame, IMessage} from "@stomp/stompjs";
import {ChatIdentifier} from "../../../model/chat-identifier";
import {AccountRepository} from "../auth/account-repository";
import {ChatSubscriber} from "./chat-subscriber";
import {environment} from "../../../environments";
import {TokenStore} from "../auth/token.store";
import {getMessageChannel} from "../event/commons";
import {SyncContext} from "../../../model/sync-context";
import {ChatEvent} from "../../../model/chat-event";
import {map, Observable, of, switchMap} from "rxjs";
import {HttpClient, HttpParams} from "@angular/common/http";
import {TypeEvent} from "../../../model/type-event";

@Injectable()
export class RealtimeClient implements OnDestroy {

      private readonly client: Client;
      private readonly messageChannel: BroadcastChannel;
      private readonly syncContext: SyncContext;

      private eventSub = (event: MessageEvent<any>) => {
            this.emit(event.data as ChatEvent)
      }


      constructor(accountRepository: AccountRepository, tokenStore: TokenStore, private httpClient: HttpClient) {
            this.syncContext = accountRepository.account!.syncContext
            this.messageChannel = getMessageChannel(accountRepository.account!.user.username)
            this.client = new Client({
                  brokerURL: environment.WEBSOCKET_HOST + '/handshake',
                  connectHeaders: {
                        'Authorization': `Bearer ${tokenStore.accessToken}`
                  },

                  reconnectDelay: 5000,
                  heartbeatIncoming: 5000,
                  heartbeatOutgoing: 5000,
                  debug: (msg: string) => console.log('[STOMP]', msg),
            });

            this.client.onConnect = (frame: Frame) => {
                  console.log('[STOMP] connect:', frame.headers);
                  this.client.subscribe("/user/queue", (msg: IMessage) => {
                        console.log('[STOMP] Event:', msg.body);
                        this.messageChannel.postMessage(JSON.parse(msg.body));
                  })
            }

            this.client.onStompError = (frame: Frame) => {
                  console.error('[STOMP] error:', frame.headers['message']);
                  console.error('[STOMP] error body:', frame.body);
            };
            this.init()
      }


      private init() {
            this.client.activate()
            this.messageChannel.addEventListener('message', this.eventSub)
      }

      private emit(event: ChatEvent) {
            event = ChatEvent.from(event)
            if (event.committed) {
                  const eventVersion = event.eventVersion!
                  if (this.syncContext.eventVersion >= eventVersion) {
                        return;
                  } else if (this.syncContext.eventVersion + 1 === eventVersion) {
                        this.syncContext.eventVersion = eventVersion
                        this.messageChannel.postMessage(event)
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
                          if (lastVersion > this.syncContext.eventVersion + 1) {
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


      public subscribeChat(
              identifier: ChatIdentifier,
              subscriber: ChatSubscriber
      ): Disposable {
            if (!this.client.connected) {
                  throw Error("Client is not connected.");
            }
            const subscription = this.client.subscribe("/typing", (msg: IMessage) => {
                  const event = TypeEvent.from(JSON.parse(msg.body));
                  subscriber(event);
            }, {
                  'chat_identifier': identifier.toString(),
            })
            return new class implements Disposable {
                  [Symbol.dispose](): void {
                        subscription.unsubscribe();
                  }
            }
      }


      public pingChat(identifier: ChatIdentifier) {
            if (this.client.connected) {
                  this.client.publish({
                        destination: '/typing',
                        headers: {
                              chat_identifier: identifier.toString(),
                        },
                        body: 'I am typing...',
                  })

            }
      }

      ngOnDestroy(): void {
            this.messageChannel.removeEventListener('message', this.eventSub)
            this.client.deactivate()
      }
}