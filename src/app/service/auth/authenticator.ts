import {Observable} from "rxjs";
import {SignUpRequest} from "../../model/dto/sign-up-request";
import {SignInRequest} from "../../model/dto/sign-in-request";
import {Profile} from "../../model/dto/profile";

export abstract class Authenticator {

      abstract loginOAuth2(idToken: string): Observable<Profile>;

      abstract signUp(body: SignUpRequest): Observable<Profile>;

      abstract signIn(body: SignInRequest): Observable<Profile>;

      abstract changePassword(oldPassword: string, newPassword: string): Observable<any>

      abstract logout(): Observable<Boolean>;
}