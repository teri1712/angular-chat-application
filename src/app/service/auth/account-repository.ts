import {Observable} from "rxjs";
import {Profile} from "../../model/dto/profile";

export abstract class AccountRepository {

      abstract get accountObservable(): Observable<Profile | null>;

      abstract get currentUser(): Profile | null;


}
