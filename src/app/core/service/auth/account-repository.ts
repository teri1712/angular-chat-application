import {Observable} from "rxjs";
import {Account} from "../../../model/account";

export abstract class AccountRepository {

      abstract get accountObservable(): Observable<Account | null>;

      abstract get account(): Account | null ;

}
