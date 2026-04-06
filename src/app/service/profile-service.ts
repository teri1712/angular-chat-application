import {DestroyRef, inject, Injectable} from "@angular/core";
import {Profile} from "../model/dto/profile";
import {AccountRepository} from "./auth/account-repository";
import {BehaviorSubject, filter, Observable, switchMap, tap} from "rxjs";
import {environment} from "../environments";
import {HttpClient} from "@angular/common/http";
import {FileIntegrity, UploadService} from "./upload-service";
import {User} from "../model/dto/user";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Injectable()
export default class ProfileService {

      private readonly profile: BehaviorSubject<Profile>;
      private readonly destroyRef = inject(DestroyRef)

      constructor(accountRepository: AccountRepository, private readonly httpClient: HttpClient, private readonly uploadService: UploadService) {
            this.profile = new BehaviorSubject<Profile>({} as Profile);

            accountRepository.accountObservable
                    .pipe(takeUntilDestroyed(this.destroyRef)
                            , filter(account => !!account))
                    .subscribe(account => {
                          this.profile.next(account)
                    })
      }


      thatsMe(user: User | string) {
            if (typeof user === 'string') {
                  return this.profile.value.id === user;
            }
            return this.profile.value.id === user.id;
      }

      getProfileObservable(): Observable<Profile> {
            return this.profile.asObservable();
      }

      getProfile(): Profile {
            return this.profile.value;
      }

      updateProfile(user: Partial<ProfileRequest>): Observable<Profile> {
            return this.httpClient.patch<Profile>(environment.API_URL + "/profiles/me", user).pipe(
                    tap(updatedUser => {
                                  this.profile.next(updatedUser);
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