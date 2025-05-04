import {Observable} from "rxjs";
import {Account} from "../../../model/account";
import {SignUpRequest} from "../../../model/dto/sign-up-request";
import {SignInRequest} from "../../../model/dto/sign-in-request";

export abstract class Authenticator {

      abstract signUp(body: SignUpRequest): Observable<Account>;

      abstract signIn(body: SignInRequest): Observable<Account>;

      abstract logout(): Observable<Boolean>;
}