import {User} from "./user";
import {Conversation} from "./conversation";

export class Online {
      conversation!: Conversation;

      constructor(public at: number, public user: User) {
      }
}