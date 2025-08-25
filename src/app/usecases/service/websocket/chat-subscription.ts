import {ChatSubscriber} from "./chat-subscriber";
import {Client, IMessage, StompSubscription} from "@stomp/stompjs";
import {TypeEvent} from "../../../model/type-event";
import {ChatIdentifier} from "../../../model/chat-identifier";

export class ChatSubscription {

      private stompSubscription?: StompSubscription;

      constructor(
              private identifier: ChatIdentifier,
              subscriber: ChatSubscriber,
              private client: Client) {
            this.stompSubscription = this.client.subscribe("/typing", (msg: IMessage) => {
                  const event = TypeEvent.from(JSON.parse(msg.body));
                  subscriber(event);
            }, {
                  'chat_identifier': identifier.toString(),
            })
      }

      ping() {
            if (this.stompSubscription && this.client.connected) {
                  this.client.publish({
                        destination: '/typing',
                        headers: {
                              chat_identifier: this.identifier.toString(),
                        },
                        body: 'Hello!',
                  })

            }
      }

      dispose() {
            this.stompSubscription?.unsubscribe();
            this.stompSubscription = undefined;
      }
}