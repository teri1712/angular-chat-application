import {ChatEvent, getConversation, isPendingEvent} from "../../../model/dto/chat-event";
import {Injectable, OnDestroy} from "@angular/core";
import {ConversationCache} from "./conversation-cache";
import {Conversation} from "../../../model/dto/conversation";
import {toIdString} from "../../../model/dto/chat-identifier";
import {RealtimeClient} from "../../websocket/realtime-client.service";
import {Subscription} from "rxjs";

@Injectable()
export default class EventCache implements OnDestroy {
      private readonly eventCacheMap = new Map<string, ConversationCache>();

      private getEventCache(conversation: Conversation): ConversationCache {
            const id = toIdString(conversation.chat.identifier)
            let eventCache = this.eventCacheMap.get(id)
            if (!eventCache) {
                  eventCache = new ConversationCache(conversation, [])
                  this.eventCacheMap.set(id, eventCache)
            }
            return eventCache!
      }

      private readonly eventSub: Subscription;
      private eventObserver = (event: ChatEvent) => {
            if (!isPendingEvent(event)) {
                  const eventCache = this.getEventCache(getConversation(event))
                  eventCache.addFirst(event)
            }
      }

      constructor(private readonly realtimeClient: RealtimeClient) {
            this.eventSub = this.realtimeClient.getEventChannel().subscribe(this.eventObserver)
      }

      ngOnDestroy(): void {
            this.eventSub.unsubscribe();
      }


      put(event: ChatEvent) {
            this.getEventCache(getConversation(event)).add(event)
      }

      list(conversation: Conversation, atVersion: number) {
            return this.getEventCache(conversation).list(atVersion)
      }


}