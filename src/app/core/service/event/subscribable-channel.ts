import {Channel} from "./channel";


export type ChannelSubscriber<T> = (value: T) => void;

export class SubscribableChannel<T> implements Channel<T> {
      
      private subscribers: ChannelSubscriber<T>[] = []

      constructor() {
      }

      subscribe(subscriber: ChannelSubscriber<T>) {
            this.subscribers.push(subscriber)
      }

      unsubscribe(subscriber: ChannelSubscriber<T>) {
            this.subscribers = this.subscribers.filter((s) => s !== subscriber)
      }

      post(value: T): void {
            for (let subscriber of this.subscribers) {
                  subscriber(value)
            }
      }
}