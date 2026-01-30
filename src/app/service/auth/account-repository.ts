import {Observable} from "rxjs";
import {User} from "../../model/dto/user";

export abstract class AccountRepository {

      abstract get accountObservable(): Observable<User | null>;

      abstract get loginAtVersion(): number | null;

      abstract get currentUser(): User | null;

}
