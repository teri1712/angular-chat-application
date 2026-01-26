import {User} from "./user";
import {Conversation} from "./conversation";

export class Online {
      conversation!: Conversation;

      constructor(public at: number, public user: User) {
      }

      static from(raw: any): Online {
            const user = User.from({
                  id: raw.userId ?? raw.id ?? raw.user?.id ?? "",
                  username: raw.username ?? raw.user?.username ?? "",
                  name: raw.name ?? raw.user?.name ?? "",
                  avatar: raw.avatar ?? raw.user?.avatar
            });
            const at = Online.parseAt(raw.at);
            return new Online(at, user);
      }

      private static parseAt(value: any): number {
            if (typeof value === 'number') {
                  if (value > 1000000000000) {
                        return Math.floor(value / 1000);
                  }
                  return value;
            }
            if (typeof value === 'string') {
                  const ms = Date.parse(value);
                  if (!Number.isNaN(ms)) {
                        return Math.floor(ms / 1000);
                  }
            }
            return Math.floor(Date.now() / 1000);
      }
}