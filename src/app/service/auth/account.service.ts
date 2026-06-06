import {inject, Injectable, signal, Signal} from '@angular/core';
import {catchError, from, map, Observable, of, switchMap, tap} from "rxjs";
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParams, HttpResponse} from "@angular/common/http";
import {environment} from "../../environments";
import {Authenticator} from "./authenticator";
import {Account} from "../../model/dto/account";
import {SignUpRequest} from "../../model/dto/sign-up-request";
import {SignInRequest} from "../../model/dto/sign-in-request";
import {Profile} from "../../model/dto/profile";
import {FileIntegrity, PresignedUpload} from "../upload-service";
import {TokenStore} from "./token-store.service";


@Injectable({
    providedIn: 'root',
})
export class AccountService extends TokenStore implements Authenticator {
    private readonly _justLoggedIn = signal(false)

    get justLoggedIn(): Signal<Boolean> {
        return this._justLoggedIn.asReadonly()
    }

    httpClient = inject(HttpClient)

    loginOAuth2(idToken: string): Observable<Profile> {
        const headers = new HttpHeaders({
            'Oauth2-Token': idToken
        });

        return this.httpClient.post<Account>(
            environment.API_URL + "/tokens/oauth2",
            null,
            {headers}
        ).pipe(
            map((account) => {
                this.storeSession(account.profile, account.accessToken)
                return account.profile
            })
        );
    }

    private uploadAvatar(presignUrl: string, avatar: File): Observable<Profile> {
        return this.httpClient.post<PresignedUpload>(presignUrl, {}, {observe: 'body'}).pipe(
            switchMap((presigned: PresignedUpload) => {
                    return from(fetch(presigned.presignedUploadUrl, {
                        method: 'PUT',
                        body: avatar,
                        headers: {
                            'Content-Type': 'application/octet-stream'
                        }
                    })).pipe(map((response) => {
                        const eTag = response.headers.get("ETag");
                        return ({
                            eTag: eTag,
                            fileKey: presigned.fileKey
                        }) as FileIntegrity
                    }));
                }
            ),
            switchMap((file) => {
                return this.httpClient.patch<Profile>(environment.API_URL + "/profiles/me", {
                    avatar: file,
                }, {
                    observe: 'body'
                })
            })
        )
    }

    signUp(request: SignUpRequest): Observable<Profile> {
        const username = request.username;
        const password = request.password;

        return this.httpClient.post<Profile>(environment.API_URL + "/users", {
            username: username,
            password: password,
            name: request.name,
            gender: request.gender,
            dob: request.dob
        }, {
            observe: 'body',
        }).pipe(
            switchMap((profile) => {
                return this.signIn({username: username, password: password})
            }),
            switchMap((profile) => {
                const avatar = request.avatar;
                if (!avatar)
                    return of(profile);
                const presignUrl = environment.API_URL + '/files/upload?filename=' + encodeURIComponent(avatar.name);
                return this.uploadAvatar(presignUrl, avatar);
            }),
            tap((profile) => {
                this.updateProfile(profile)
            })
        )
    }

    signIn(body: SignInRequest): Observable<Profile> {
        const params = new HttpParams()
            .set('username', body.username)
            .set('password', body.password);
        return this.httpClient.post<Account>(environment.API_URL + "/login", params.toString(), {
            observe: 'body',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).pipe(
            map((account) => {
                this.storeSession(account.profile, account.accessToken)
                this._justLoggedIn.set(true)
                return account.profile
            })
        )
    }

    logout(): Observable<boolean> {
        return this.httpClient.post<any>(environment.API_URL + "/logout",
            new HttpParams(), {
                observe: 'response',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).pipe(
            map((response: HttpResponse<any>) => {
                this._justLoggedIn.set(false)
                this.clearSession()
                return true
            }),
            catchError((error: HttpErrorResponse) => {
                if (error.status === 401 || error.status === 403) {
                    this._justLoggedIn.set(false)
                    this.clearSession()
                    return of(true);
                }
                throw error

            })
        )

    }

    changePassword(oldPassword: string, newPassword: string): Observable<any> {
        const username = this.profile()?.username!;
        const params = new HttpParams()
            .set('password', oldPassword)
            .set('new_password', newPassword);
        return this.httpClient.post(environment.API_URL + "/profiles/me/password", params.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).pipe(switchMap(() => {

                const params = new HttpParams()
                    .set('password', newPassword)
                    .set('username', username);
                return this.httpClient.post<Account>(environment.API_URL + "/login", params.toString(), {
                    observe: 'body',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                })
            }),
            map((account) => {
                this.storeSession(account.profile, account.accessToken)
                return true
            }));
    }

}
