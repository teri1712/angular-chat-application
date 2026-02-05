import {Inject, Injectable, OnDestroy} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {AccountRepository} from "./auth/account-repository";
import {getMyMessageChannel} from "./event/commons";
import {ChatEvent} from "../model/dto/chat-event";
import {EventHandler, HANDLERS} from "./event-handler";

@Injectable()
export class MessageService implements OnDestroy {


      private queueState: 'idle' | 'sending' | 'pending' = 'idle';
      private messageChannel: BroadcastChannel;
      private queue: ChatEvent[] = [];

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

      private continue() {
            this.queueState = 'idle';
            this.queue.shift()
            this.schedule()
      }

      private onSent() {
            this.continue();
      }

      private onErrorMessage(errorEvent: ChatEvent) {
            this.messageChannel.postMessage(errorEvent);
            this.continue();
      }

      constructor(private httpClient: HttpClient,
                  private accountRepository: AccountRepository,
                  @Inject(HANDLERS) private readonly handlers: EventHandler[]) {
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
            const event = this.queue.at(0)!;
            const handler = this.handlers.find(h => h.supports(event))!;

            if (handler) {
                  handler.handle(event).subscribe((event) => {
                        this.onSent();
                  }, (error) => {
                        if (error.status === 0) {
                              this.onConnectionLost();
                        } else {
                              this.onErrorMessage(ChatEvent.from(event)
                                      .eventVersion(-1)
                                      .build());
                        }
                  })
            }
      }

      send(event: ChatEvent): void {

            this.queue.push(event);
            this.messageChannel.postMessage(event);
            this.schedule()
      }

}