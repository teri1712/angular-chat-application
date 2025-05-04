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
            return new Account(
                    account.id,
                    User.from(account.user),
                    new SyncContext(account.syncContext.eventVersion)
            );
      }
}