import {MessageState} from "../../../model/dto/message-state";
import {Injectable} from "@angular/core";
import {Cache} from "./cache";

@Injectable()
export default class CacheService {

      private readonly cacheMap = new Map<string, Cache>();

      get(chatId: string): Cache {
            let cache = this.cacheMap.get(chatId)
            if (!cache) {
                  cache = new Cache([])
                  this.cacheMap.set(chatId, cache)
            }
            return cache
      }

      constructor() {
      }

      put(message: MessageState) {
            this.get(message.chatId).put(message)
      }

      putAll(messages: MessageState[]) {
            messages.forEach(message => this.put(message));
      }

      list(chatId: string, sequenceNumber: number): MessageState[] {
            return this.get(chatId).list(sequenceNumber)
      }

}