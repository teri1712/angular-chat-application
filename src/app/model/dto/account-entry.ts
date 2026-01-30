import {Account} from "./account";
import {AccessToken} from "./access-token";

export class AccountEntry {
      constructor(public account: Account, public tokenCredential?: AccessToken) {
      }
}