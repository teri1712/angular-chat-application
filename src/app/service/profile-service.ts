import {inject, Injectable} from "@angular/core";
import {Profile} from "../model/dto/profile";
import {catchError, filter, Observable, of, switchMap, tap} from "rxjs";
import {environment} from "../environments";
import {HttpClient} from "@angular/common/http";
import {FileIntegrity, UploadService} from "./upload-service";
import {User} from "../model/dto/user";
import {TokenStore} from "./auth/token-store.service";
import {toObservable, toSignal} from "@angular/core/rxjs-interop";

@Injectable()
export default class ProfileService {

    private profileStore = inject(TokenStore)
    private httpClient = inject(HttpClient);
    private uploadService = inject(UploadService);

    readonly profile = toSignal(toObservable(
            this.profileStore.profile
        )
            .pipe(
                filter(profile => !!profile)
            ),
        {initialValue: this.profileStore.profile()!}
    )


    constructor() {

    }

    refresh() {

        return this.httpClient.get<Profile>(environment.API_URL + "/profiles/me", {observe: 'body'}).pipe(
            tap(freshProf => {
                this.profileStore.updateProfile(freshProf);
            }),
            catchError(err => {
                console.error(err)
                return of(this.profile())
            })
        )
    }

    thatsMe(user: User | string) {
        const me = this.profileStore.profile()?.id;
        if (typeof user === 'string') {
            return me === user;
        }
        return me === user.id;
    }

    updateProfile(user: Partial<ProfileRequest>): Observable<Profile> {
        return this.httpClient.patch<Profile>(environment.API_URL + "/profiles/me", user).pipe(
            tap(updatedProf => {
                    this.profileStore.updateProfile(updatedProf);
                }
            )
        );
    }

    updateAvatar(file: File): Observable<Profile> {
        const filename = file.name;
        return this.uploadService.upload(filename, file).pipe(switchMap(
            (integrity) =>
                this.updateProfile({
                    avatar: integrity
                })));
    }

}

export type ProfileRequest = {
    name: string,
    gender: number,
    dob: string,
    avatar: FileIntegrity
};