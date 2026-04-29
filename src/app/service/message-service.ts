import {DestroyRef, effect, inject, Inject, Injectable} from "@angular/core";
import {EventHandler, HANDLERS} from "./event-handler";

import {v4 as uuidv4} from "uuid";
import {ISendingMessage, SendState} from "../model/message";
import {BehaviorSubject, fromEvent, map, merge, Observable, shareReplay} from "rxjs";
import {LogStream} from "./repository/log-stream.service";
import {takeUntilDestroyed, toSignal} from "@angular/core/rxjs-interop";

@Injectable()
export class MessageService {

    private queueState: 'idle' | 'sending' | 'networkwaiting' = 'idle';
    private readonly sendMap: Map<string, BehaviorSubject<ISendingMessage[]>> = new Map();

    private readonly queue: MessagePosting[] = [];
    private readonly destroyRef = inject(DestroyRef);


    isOnline = toSignal(merge(
            fromEvent(window, 'online').pipe(map(() => true)),
            fromEvent(window, 'offline').pipe(map(() => false))
        ).pipe(
            shareReplay(1)
        ),
        {initialValue: navigator.onLine});

    constructor(
        logStream: LogStream,
        @Inject(HANDLERS) private readonly handlers: EventHandler[]) {
        logStream.getChannel()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((log) => {
                const message = log.messageState;
                if (message) {

                    const posting: MessagePosting = {
                        id: message.postingId,
                        chatId: message.chatId
                    }
                    this.onReceived(posting)
                }
            });
        effect(() => {
            if (this.isOnline()) {
                this.onNetworkConnected()
            }
        });
    }

    private onNetworkConnected() {
        if (this.queueState === 'networkwaiting') {
            this.queueState = 'idle';
            this.schedule()
        }
    }

    private onNetworkError() {
        if (this.isOnline()) {
            this.continue()
        } else {
            this.queueState = 'networkwaiting';
        }
    }

    private continue() {
        this.queueState = 'idle';
        this.schedule()
    }


    private onReceived(posting: MessagePosting) {
        const postingId = posting.id;

        const sendings = this.getOrCreateSendingMessages(posting.chatId);
        sendings.next(sendings.value
            .filter(sending =>
                sending.postingId !== postingId)
        );
    }

    private onSent(posting: MessagePosting) {
        const sendings = this.getOrCreateSendingMessages(posting.chatId);

        sendings.next(sendings.value.map(sending => {
            if (sending.postingId === posting.id) {
                return {
                    postingId: posting.id,
                    mockState: sending.mockState,
                    sendState: SendState.Sent
                };
            }
            return sending;
        }))
        this.continue();
    }

    private onError(posting: MessagePosting) {
        const sendings = this.getOrCreateSendingMessages(posting.chatId);

        sendings.next(sendings.value.map(sending => {
            if (sending.postingId === posting.id) {
                return {
                    postingId: posting.id,
                    mockState: sending.mockState,
                    sendState: SendState.Error
                };
            }
            return sending;
        }))
        this.continue();
    }


    private onPending(posting: MessagePosting) {

        const handler = this.handlers.find(h =>
            h.supports(posting))!;

        if (handler) {
            this.queue.push(posting);
            const postingId = posting.id;
            const mockState = handler.mock(posting);
            if (mockState) {
                const sending = this.getOrCreateSendingMessages(posting.chatId);
                sending.next([
                    {
                        postingId: postingId,
                        mockState: mockState,
                        sendState: SendState.Pending
                    },
                    ...sending.value])
            }
        }
    }

    onRetried(posting: MessagePosting) {
        const sendings = this.getOrCreateSendingMessages(posting.chatId);
        const postingId = posting.id;
        sendings.next(sendings.value.map((sending) => {
            if (sending.postingId === postingId) {
                return {
                    postingId: postingId,
                    mockState: sending.mockState,
                    sendState: SendState.Pending
                }
            }
            return sending
        }))
        this.queue.push(posting)
    }


    private onSending(posting: MessagePosting) {
        const chatId = posting.chatId
        const postingId = posting.id
        const sendings = this.getOrCreateSendingMessages(chatId);

        sendings.next(sendings.value.map(sending => {
            if (sending.postingId === postingId) {
                return {
                    postingId: postingId,
                    mockState: sending.mockState,
                    sendState: SendState.Sending
                };
            }
            return sending;
        }))

    }

    private schedule() {
        if (this.queueState != 'idle' || this.queue.length === 0) {
            return
        }
        this.queueState = 'sending';
        const posting = this.queue.shift()!;
        const handler = this.handlers.find(handler =>
            handler.supports(posting));

        if (handler) {
            this.onSending(posting);

            handler.handle(posting).subscribe({
                next: () => {
                    this.onSent(posting);
                },
                error: (error) => {
                    this.onError(posting);
                    if (error.status === 0) {
                        this.onNetworkError();
                    }
                }
            })
        }
    }

    retry(posting: MessagePosting) {
        this.onRetried(posting)
        this.schedule()
    }

    send(posting: MessagePosting): void {

        this.onPending(posting)
        this.schedule()

    }

    private getOrCreateSendingMessages(chatId: string): BehaviorSubject<ISendingMessage[]> {
        const sending = this.sendMap.get(chatId)
            ?? new BehaviorSubject<ISendingMessage[]>([]);
        this.sendMap.set(chatId, sending);
        return sending;
    }

    public getSendingMessages(chatId: string): Observable<ISendingMessage[]> {
        return this.getOrCreateSendingMessages(chatId).asObservable();
    }
}

export abstract class MessagePosting {
    readonly id: string = uuidv4()

    abstract get chatId(): string;
}