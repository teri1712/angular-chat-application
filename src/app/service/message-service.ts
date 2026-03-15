import {DestroyRef, inject, Inject, Injectable, OnDestroy} from "@angular/core";
import {EventHandler, HANDLERS} from "./event-handler";

import {v4 as uuidv4} from "uuid";
import {ISendingMessage, SendState} from "../model/message";
import {BehaviorSubject, Observable} from "rxjs";
import {LogRepository} from "./repository/log-repository";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Injectable()
export class MessageService implements OnDestroy {


      private queueState: 'idle' | 'sending' | 'pending' = 'idle';
      private readonly sendMap: Map<string, BehaviorSubject<ISendingMessage[]>> = new Map();
      private readonly postingMap: Map<string, MessagePosting> = new Map();

      private queue: MessagePosting[] = [];

      private onConnected = () => {
            if (this.queueState === 'pending') {
                  this.queueState = 'idle';
                  this.schedule()
            }
      }

      private onDisconnected() {
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

      private onReceived(postingId: string) {
            const posting = this.postingMap.get(postingId);
            if (posting) {
                  const pendingOnes = this.sendMap.get(posting.chatId);

                  if (pendingOnes) {
                        pendingOnes.next(pendingOnes.value
                                .filter(s => s.postingId !== posting.id)
                        );
                  }
                  this.postingMap.delete(postingId);
            }
      }

      private onSent(posting: MessagePosting) {
            this.continue();
      }

      private onError(posting: MessagePosting) {
            const pendingQueue = this.getOrCreateSendingQueue(posting.chatId);

            const errorIndex = pendingQueue.value.findIndex(s => s.postingId === posting.id)!;
            if (errorIndex === -1) {
                  const errorOne = pendingQueue.value[errorIndex];
                  pendingQueue.value[errorIndex] = {
                        postingId: posting.id,
                        mockState: errorOne.mockState,
                        sendState: SendState.Error
                  };
                  pendingQueue.next(pendingQueue.value);
            }
            this.reschedule(posting);
            this.continue();
      }

      private reschedule(posting: MessagePosting) {
      }


      private destroyRef = inject(DestroyRef);

      constructor(
              logRepository: LogRepository,
              @Inject(HANDLERS) private readonly handlers: EventHandler[]) {
            window.addEventListener('online', this.onConnected);
            logRepository.getChannel()
                    .pipe(takeUntilDestroyed(this.destroyRef))
                    .subscribe((log) => {
                          this.onReceived(log.postingId)
                    });
      }

      ngOnDestroy(): void {
            window.removeEventListener('online', this.onConnected);
      }


      private markToSending(postingId: string, chatId: string) {
            const pendingQueue = this.getOrCreateSendingQueue(chatId);
            const messages = pendingQueue.value;

            const sendingIndex = messages.findIndex(s => s.postingId === postingId);
            const sendingOne = messages[sendingIndex];
            if (sendingOne) {
                  messages[sendingIndex] = {
                        postingId: postingId,
                        mockState: sendingOne.mockState,
                        sendState: SendState.Sending
                  }
                  pendingQueue.next(messages);
            }
      }

      private schedule() {
            if (this.queueState != 'idle' || this.queue.length === 0) {
                  return
            }
            this.queueState = 'sending';
            const posting = this.queue.at(0)!;
            const handler = this.handlers.find(handler => handler.supports(posting))!;

            if (handler) {
                  this.markToSending(posting.id, posting.chatId);

                  handler.handle(posting).subscribe(() => {
                        this.onSent(posting);
                  }, (error) => {
                        if (error.status === 0) {
                              this.onDisconnected();
                        } else {
                              this.onError(posting);
                        }
                  })
            }
      }

      send(posting: MessagePosting): void {

            // this.messageChannel.postMessage(event);
            const handler = this.handlers.find(h => h.supports(posting))!;

            if (handler) {
                  const postingId = posting.id;
                  this.postingMap.set(postingId, posting);
                  const mockState = handler.mock(posting);
                  if (mockState) {
                        const sending = this.getOrCreateSendingQueue(posting.chatId);

                        sending.value.unshift({
                              postingId: postingId,
                              mockState: mockState,
                              sendState: SendState.Pending
                        })
                        sending.next(sending.value);
                  }
                  this.queue.push(posting);
                  this.schedule()
            }

      }

      private getOrCreateSendingQueue(chatId: string): BehaviorSubject<ISendingMessage[]> {
            const sending = this.sendMap.get(chatId)
                    ?? new BehaviorSubject<ISendingMessage[]>([]);
            this.sendMap.set(chatId, sending);
            return sending;
      }

      public getSendingQueue(chatId: string): Observable<ISendingMessage[]> {
            return this.getOrCreateSendingQueue(chatId).asObservable();
      }
}

export abstract class MessagePosting {
      readonly id: string = uuidv4()

      abstract get chatId(): string;
}