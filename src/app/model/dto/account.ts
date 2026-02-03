import {User} from "./user";
import {SyncContext} from "./sync-context";

export class Account {
      constructor(
              public id: string,
              public user: User,
              public syncContext: SyncContext,
      ) {
      }
}