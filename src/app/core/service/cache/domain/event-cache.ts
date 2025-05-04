import {Injectable, OnDestroy} from "@angular/core";
import {Conversation} from "../../../../model/conversation";
import {ChatEvent} from "../../../../model/chat-event";
import {Cache} from "./cache";
import {ChatSnapshot} from "../../../../model/chat-snapshot";
import {ChannelSubscriber} from "../../event/subscribable-channel";
import {AccountManager} from "../../auth/account-manager";

@Injectable()
export class EventCache implements Cache<Conversation, ChatEvent[]>, OnDestroy {

      private sub: ChannelSubscriber<ChatEvent> = (event) => {
            event = ChatEvent.from(event)
            const snapshot = this.getSnapshot(event.conversation)
            snapshot.addFirst(event)
      }

      constructor(private accountManager: AccountManager) {
            this.accountManager.eventChannel.subscribe(this.sub)
      }

      ngOnDestroy(): void {
            this.accountManager.eventChannel.unsubscribe(this.sub)
      }

      private readonly snapshotMap = new Map<string, ChatSnapshot>();

      private getSnapshot(conversation: Conversation): ChatSnapshot {
            const id = conversation.identifier.toString()
            let snapshot = this.snapshotMap.get(id)
            if (!snapshot) {
                  snapshot = new ChatSnapshot(conversation, [])
                  this.snapshotMap.set(id, snapshot)
            }
            return snapshot!
      }

      get(conversation: Conversation): ChatEvent[] {
            return this.getSnapshot(conversation).eventList
      }

      save(conversation: Conversation, eventList: ChatEvent[]) {
            this.getSnapshot(conversation).addAll(eventList)
      }
}