import {Injectable, OnDestroy} from "@angular/core";
import {Client, Frame, IMessage} from "@stomp/stompjs";
import {ChatIdentifier, toIdString} from "../../model/dto/chat-identifier";
import {AccountRepository} from "../auth/account-repository";
import {ChatSubscriber} from "./chat-subscriber";
import {environment} from "../../environments";
import {TokenStore} from "../auth/token.store";
import {SyncContext} from "../../model/dto/sync-context";
import {ChatEvent} from "../../model/dto/chat-event";
import {finalize, map, Observable, of, Subject, Subscription, switchMap} from "rxjs";
import {HttpClient, HttpParams} from "@angular/common/http";
import {TypeEvent} from "../../model/dto/type-event";
import {getMyMessageChannel} from "../event/commons";

@Injectable()
export class RealtimeClient implements OnDestroy {

      private readonly client: Client;
      private readonly syncContext: SyncContext;
      private readonly myMessageChannel: BroadcastChannel;
      private readonly myMessageSub = (message: MessageEvent<any>) => {
            const event = message.data as ChatEvent;
            this.eventChannel.next(event)
      }

      private readonly eventChannel: Subject<ChatEvent> = new Subject<ChatEvent>();

      constructor(accountRepository: AccountRepository, tokenStore: TokenStore, private httpClient: HttpClient) {
            this.myMessageChannel = getMyMessageChannel(accountRepository.currentUser?.username!)
            this.syncContext = new SyncContext(accountRepository.loginAtVersion!)
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
                        this.emit(JSON.parse(msg.body))
                  })
            }

            this.client.onStompError = (frame: Frame) => {
                  console.error('[STOMP] error:', frame.headers['message']);
                  console.error('[STOMP] error body:', frame.body);
            };
            this.init()
      }


      private init() {
            this.myMessageChannel.addEventListener('message', this.myMessageSub)
            this.client.activate()
      }

      public get syncVersion(): number {
            return this.syncContext.eventVersion
      }

      getEventChannel(): Observable<ChatEvent> {
            return this.eventChannel.asObservable()
      }

      private emit(event: ChatEvent) {
            const eventVersion = event.eventVersion!
            if (this.syncContext.eventVersion >= eventVersion) {
                  return;
            } else if (this.syncContext.eventVersion + 1 === eventVersion) {
                  this.syncContext.eventVersion = eventVersion
                  this.eventChannel.next(event)
            } else {
                  this.resolveMissing(eventVersion)
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
      ): Subscription {
            if (!this.client.connected) {
                  throw Error("Client is not connected.");
            }
            const observable = new Subject<TypeEvent>();
            const subscription = this.client.subscribe("/typing", (msg: IMessage) => {
                  observable.next(JSON.parse(msg.body));
            }, {
                  'chat_identifier': toIdString(identifier),
            })
            return observable.pipe(
                    finalize(() => {
                          subscription.unsubscribe();
                    })).subscribe((event) => {
                  subscriber(event)
            })
      }


      public pingChat(identifier: ChatIdentifier) {
            if (this.client.connected) {
                  this.client.publish({
                        destination: '/typing',
                        headers: {
                              chat_identifier: toIdString(identifier),
                        },
                        body: 'I am typing...',
                  })

            }
      }

      ngOnDestroy(): void {
            this.client.deactivate()
            this.myMessageChannel.removeEventListener('message', this.myMessageSub)
      }
}