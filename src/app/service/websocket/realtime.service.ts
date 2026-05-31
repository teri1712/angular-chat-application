import {effect, inject, Injectable} from "@angular/core";
import {Client, Frame, IMessage} from "@stomp/stompjs";
import {environment} from "../../environments";
import {BehaviorSubject, delay, Observable, of, switchMap, tap} from "rxjs";
import {HttpClient, HttpParams} from "@angular/common/http";
import {InboxLog} from "../../model/dto/inbox-log";
import {LogStream} from "../repository/log-stream.service";
import {TypeMessage} from "../../model/dto/type-message";
import {PreferenceMessage} from "../../model/dto/preference-message";
import {ITokenStore} from "../auth/token-store.interface";
import {LiveChatService} from "../repository/live-chat.service";


@Injectable()
export class RealtimeService extends LogStream implements LiveChatService {

    private stage: ClientStage = ClientStage.DISCONNECTED;
    private currentSequence: number;

    private client?: Client;
    private readonly connectionSubject = new BehaviorSubject<Client | undefined>(undefined);
    private tokenStore = inject(ITokenStore)
    private httpClient = inject(HttpClient)

    constructor() {
        super()
        this.currentSequence = Number.MAX_SAFE_INTEGER;
        effect((onCleanup) => {
            const token = this.tokenStore.accessToken()
            if (token)
                this.onTokenChange(token)
            onCleanup(() =>
                this.disconnect()
            )
        });
    }

    onTokenChange(token: string) {
        this.disconnect()
        this.connect(token);
    }

    private disconnect() {
        this.client?.deactivate();
        this.client = undefined;
        this.connectionSubject.next(undefined);
        this.stage = ClientStage.DISCONNECTED;
    }

    onLogout() {
        this.disconnect();
    }

    typeToRoom(chatId: string): void {
        if (this.client?.connected) {
            this.client.publish({
                destination: '/room/' + chatId,
                headers: {},
                body: 'I am typing...',
            })
        }
    }

    subscribeRoom(chatId: string): Observable<TypeMessage> {
        return this.connectionSubject.pipe(
            switchMap(client => {
                if (!client || !client.connected) {
                    return of();
                }
                return new Observable<TypeMessage>((observer) => {
                    const subscription = client.subscribe(
                        "/room/" + chatId,
                        (msg: IMessage) => {
                            observer.next(JSON.parse(msg.body));
                        },
                        {}
                    );

                    return () => {
                        subscription.unsubscribe();
                    };
                });
            })
        );
    }

    subscribeSettings(chatId: string): Observable<PreferenceMessage> {
        return this.connectionSubject.pipe(
            switchMap(client => {
                if (!client || !client.connected) {
                    return of();
                }
                return new Observable<PreferenceMessage>((observer) => {
                    const subscription = client.subscribe(
                        "/setting/" + chatId,
                        (msg: IMessage) => {
                            observer.next(JSON.parse(msg.body));
                        },
                        {}
                    );

                    return () => {
                        subscription.unsubscribe();
                    };
                });
            })
        );
    }


    private connect(accessToken: string) {
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
            this.connectionSubject.next(client);
            client.subscribe("/user/queue", (msg: IMessage) => {
                const log = JSON.parse(msg.body) as InboxLog;
                console.log('[STOMP] Event:', log);
                if (this.stage === ClientStage.CONNECTED)
                    this.emit(log);
            })
            if (this.currentSequence === Number.MAX_SAFE_INTEGER) {
                this.stage = ClientStage.CONNECTED;
            } else {
                this.stage = ClientStage.RECONNECTING;
                this.download(this.currentSequence + 1).subscribe(
                    () => {
                        this.stage = ClientStage.CONNECTED;
                    })
            }
        }

        client.onDisconnect = (frame: Frame) => {
            this.connectionSubject.next(undefined);
            this.stage = ClientStage.DISCONNECTED;
        }

        client.onStompError = (frame: Frame) => {
            console.error('[STOMP] error:', frame.headers['message']);
            console.error('[STOMP] error body:', frame.body);
        };
        client.activate()
    }

    private emit(log: InboxLog) {
        this.currentSequence = log.sequenceNumber;
        this.publish(log)
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

}


enum ClientStage {
    CONNECTED,
    RECONNECTING,
    DISCONNECTED
}