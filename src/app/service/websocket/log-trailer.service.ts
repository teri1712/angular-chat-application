import {Injectable, OnDestroy} from "@angular/core";
import {Client, Frame, IMessage} from "@stomp/stompjs";
import {environment} from "../../environments";
import {ITokenStore, TokenListener} from "../auth/token.store";
import {delay, finalize, Observable, of, Subject, switchMap, tap} from "rxjs";
import {HttpClient, HttpParams} from "@angular/common/http";
import {InboxLog} from "../../model/dto/inbox-log";
import {LogStream} from "../repository/log-stream.service";
import {TypeMessage} from "../../model/dto/type-message";
import {PreferenceMessage} from "../../model/dto/preference-message";


@Injectable()
export class LogTrailerService implements OnDestroy, TokenListener {

      private stage: ClientStage = ClientStage.DISCONNECTED;
      private currentSequenceNumber: number;

      private client?: Client;


      constructor(private readonly tokenStore: ITokenStore, private readonly httpClient: HttpClient, private readonly logStream: LogStream) {
            this.currentSequenceNumber = Number.MAX_SAFE_INTEGER;
            this.tokenStore.addTokenListener(this)
      }

      onTokenChange(token: string) {
            this.client?.deactivate();
            this.init(token);
      }

      onLogout() {
            this.client?.deactivate();
            this.client = undefined
      }

      send(chatId: string): void {
            if (this.client?.connected) {
                  this.client.publish({
                        destination: '/room/' + chatId,
                        headers: {},
                        body: 'I am typing...',
                  })
            }
      }

      subscribeRoom(chatId: string): Observable<TypeMessage | PreferenceMessage> {
            if (!this.client?.connected) {
                  throw new Error("Client is not connected.");
            }
            const observable = new Subject<TypeMessage | PreferenceMessage>();
            const subscription = this.client.subscribe("/room/" + chatId, (msg: IMessage) => {
                  observable.next(JSON.parse(msg.body));
            }, {})
            return observable.pipe(
                    finalize(() => {
                          subscription.unsubscribe();
                    }));
      }


      private init(accessToken: string) {
            const client = new Client({
                  brokerURL: environment.WEBSOCKET_HOST + '/handshake',
                  connectHeaders: {
                        'Authorization': `Bearer ${accessToken}`
                  },

                  reconnectDelay: 5000,
                  heartbeatIncoming: 5000,
                  heartbeatOutgoing: 5000,
                  debug: (msg: string) => console.debug('[STOMP]', msg),
            });
            this.client = client;

            client.onConnect = (frame: Frame) => {
                  client.subscribe("/user/queue", (msg: IMessage) => {
                        const log = JSON.parse(msg.body) as InboxLog;
                        console.log('[STOMP] Event:', log);
                        if (this.stage === ClientStage.CONNECTED)
                              this.emit(log);
                  })
                  if (this.currentSequenceNumber === Number.MAX_SAFE_INTEGER) {
                        this.stage = ClientStage.CONNECTED;
                  } else {
                        this.stage = ClientStage.RECONNECTING;
                        this.download(this.currentSequenceNumber).subscribe(
                                () => {
                                      this.stage = ClientStage.CONNECTED;
                                })
                  }
            }

            client.onDisconnect = (frame: Frame) => {
                  this.stage = ClientStage.DISCONNECTED;
            }

            client.onStompError = (frame: Frame) => {
                  console.error('[STOMP] error:', frame.headers['message']);
                  console.error('[STOMP] error body:', frame.body);
            };
            client.activate()
      }

      private emit(log: InboxLog) {
            const sequenceNumber = log.sequenceNumber
            this.currentSequenceNumber = sequenceNumber;
            this.logStream.publish(log)
      }

      private emitAll(logs: InboxLog[]) {
            logs.forEach((log: InboxLog) => {
                  this.emit(log)
            })
      }

      private download(sequenceNumber: number): Observable<InboxLog[]> {
            const params = new HttpParams()
                    .set("anchorSequenceNumber", sequenceNumber);

            return this.httpClient.get<InboxLog[]>(environment.API_URL + "/users/me/logs", {
                  observe: 'body',
                  params: params
            }).pipe(
                    delay(500),
                    tap((logs) => {
                          this.emitAll(logs)
                    }),
                    delay(500),
                    switchMap((logs: InboxLog[]) => {
                          const firstSequence = logs.at(-1)?.sequenceNumber
                          return firstSequence ? this.download(firstSequence + 1) : of([]);
                    })
            )
      }


      ngOnDestroy(): void {
            this.tokenStore.removeTokenListener(this)
            this.client?.deactivate()
            this.client = undefined
      }
}


enum ClientStage {
      CONNECTED,
      RECONNECTING,
      DISCONNECTED
}