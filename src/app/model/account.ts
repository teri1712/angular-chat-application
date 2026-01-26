import {User} from "./user";
import {AccessToken} from "./access-token";
import {SyncContext} from "./sync-context";

export class Account {
      constructor(
              public id: string,
              public user: User,
              public syncContext: SyncContext,
              public credential?: AccessToken,
      ) {
      }

      static from(account: any): Account {
            const user = User.from(account.user);
            const id = account.id ?? user.id ?? "";
            return new Account(
                    id,
                    user,
                    new SyncContext(account.syncContext?.eventVersion ?? 0)
            );
      }
}