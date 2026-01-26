import {Account} from "../../../model/account";
import {SubscribableChannel} from "../event/subscribable-channel";
import {ChatEvent} from "../../../model/chat-event";
import {User} from "../../../model/user";
import {Injectable, OnDestroy} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {AccountRepository} from "./account-repository";

@Injectable()
export class AccountManager implements OnDestroy {

      private readonly account: Account


      constructor(
              accountRepository: AccountRepository,
              private httpClient: HttpClient,
      ) {
            this.account = Account.from(accountRepository.account);
            this.init()
      }


      get user(): User {
            return this.account.user;
      }

      get eventVersion(): number {
            return this.account.syncContext.eventVersion;
      }

      private set eventVersion(value: number) {
            this.account.syncContext.eventVersion = value;
      }

      get eventChannel(): SubscribableChannel<ChatEvent> {
            return this.channel;
      }

      ngOnDestroy(): void {
      }
}