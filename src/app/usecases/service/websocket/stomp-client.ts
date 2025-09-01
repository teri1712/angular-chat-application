import {Injectable, OnDestroy} from "@angular/core";
import {Client, Frame, IMessage} from "@stomp/stompjs";
import {ChatIdentifier} from "../../../model/chat-identifier";
import {AccountRepository} from "../auth/account-repository";
import {ChatSubscriber} from "./chat-subscriber";
import {ChatSubscription} from "./chat-subscription";
import {environment} from "../../../environments";

@Injectable()
export class StompClient implements OnDestroy {

      private readonly client: Client;
      private broadcastChannel: BroadcastChannel;

      constructor(accountRepository: AccountRepository) {
            this.broadcastChannel = new BroadcastChannel("MESSAGE_CHANNEL_" + accountRepository.account?.id)
            this.client = new Client({
                  brokerURL: 'ws://' + environment.API_URL + '/handshake',
                  connectHeaders: {},

                  reconnectDelay: 5000,
                  heartbeatIncoming: 5000,
                  heartbeatOutgoing: 5000,
                  debug: (msg: string) => console.log('[STOMP]', msg),
            });

            this.client.onConnect = (frame: Frame) => {
                  console.log('[STOMP] connect:', frame.headers);
                  this.client.subscribe("/user/queue", (msg: IMessage) => {
                        console.log('[STOMP] Event:', msg.body);
                        this.broadcastChannel.postMessage(JSON.parse(msg.body));
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
      }

      public subscribe(
              identifier: ChatIdentifier,
              subscriber: ChatSubscriber
      ): ChatSubscription | undefined {
            if (!this.client.connected) {
                  return undefined;
            }
            return new ChatSubscription(identifier, subscriber, this.client)
      }

      ngOnDestroy(): void {
            this.client.deactivate()
      }
}