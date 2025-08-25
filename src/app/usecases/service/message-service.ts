import {Injectable, OnDestroy} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Conversation} from "../../model/conversation";
import {ChatEvent} from "../../model/chat-event";
import {AccountManager} from "./auth/account-manager";
import {EventHandlerStrategy} from "./event-handler.strategy";

@Injectable()
export class MessageService implements OnDestroy {

      private queueState: 'idle' | 'sending' | 'pending' = 'idle';
      private queue: {event: ChatEvent, strategy: EventHandlerStrategy}[] = [];

      private onOnline = () => {
            if (this.queueState === 'pending') {
                  this.queueState = 'idle';
                  this.schedule()
            }
      }

      private onConnectionLost() {
            if (navigator.onLine) {
                  this.queueState = 'idle';
                  this.schedule()
            } else {
                  this.queueState = 'pending';
            }
      }

      private onSent() {
            this.queueState = 'idle';
            this.queue.shift()
            this.schedule()
      }

      constructor(private httpClient: HttpClient, private accountManager: AccountManager) {
            window.addEventListener('online', this.onOnline);
      }

      ngOnDestroy(): void {
            window.removeEventListener('online', this.onOnline);
      }

      private schedule() {
            if (this.queueState != 'idle' || this.queue.length === 0) {
                  return
            }
            this.queueState = 'sending';
            const item = this.queue.at(0)!;
            const strategy = item.strategy;
            const event = item.event;

            strategy.prepare(event);
            strategy.send(this.httpClient, event, () => this.onSent(), () => this.onConnectionLost());
      }

      send(conversation: Conversation, strategy: EventHandlerStrategy): void {

            const event = new ChatEvent();
            event.chatIdentifier = conversation.identifier;
            event.sender = conversation.owner.id;
            event.conversation = conversation;

            strategy.configureEvent(event);

            this.queue.push({event, strategy});
            this.schedule()

            this.accountManager.eventChannel.post(event);
      }

}