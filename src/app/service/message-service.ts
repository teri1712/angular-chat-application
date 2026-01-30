import {Injectable, OnDestroy} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Conversation} from "../model/dto/conversation";
import {EventHandlerStrategy} from "./event-handler.strategy";
import {AccountRepository} from "./auth/account-repository";
import {getMyMessageChannel} from "./event/commons";

@Injectable()
export class MessageService implements OnDestroy {

      private queueState: 'idle' | 'sending' | 'pending' = 'idle';
      private messageChannel: BroadcastChannel;
      private queue: EventHandlerStrategy[] = [];

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

      constructor(private httpClient: HttpClient, private accountRepository: AccountRepository) {
            window.addEventListener('online', this.onOnline);
            this.messageChannel = getMyMessageChannel(accountRepository.currentUser?.username!);
      }

      ngOnDestroy(): void {
            window.removeEventListener('online', this.onOnline);
      }

      private schedule() {
            if (this.queueState != 'idle' || this.queue.length === 0) {
                  return
            }
            this.queueState = 'sending';
            const strategy = this.queue.at(0)!;

            strategy.send(this.httpClient, () => this.onSent(), () => this.onConnectionLost());
      }

      send(conversation: Conversation, strategy: EventHandlerStrategy): void {

            const event = strategy.create();

            this.queue.push(strategy);
            this.schedule()
            this.messageChannel.postMessage(event);
      }

}