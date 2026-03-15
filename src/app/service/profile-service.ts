import {Injectable} from "@angular/core";
import {Profile} from "../model/dto/profile";
import {AccountRepository} from "./auth/account-repository";
import {BehaviorSubject, Observable, switchMap, tap} from "rxjs";
import {environment} from "../environments";
import {HttpClient} from "@angular/common/http";
import {UploadService} from "./upload-service";
import {ImageSpec} from "../model/dto/image-spec";
import {User} from "../model/dto/user";

@Injectable()
export default class ProfileService {

      private readonly profile: BehaviorSubject<Profile>;

      constructor(accountRepository: AccountRepository, private readonly httpClient: HttpClient, private readonly uploadService: UploadService) {
            this.profile = new BehaviorSubject<Profile>(accountRepository.currentUser!);
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
                    (downloadUrl) =>
                            this.updateProfile({
                                  avatar: {
                                        uri: downloadUrl.path,
                                        filename: filename,
                                        width: 200,
                                        height: 200,
                                        format: 'jpg'
                                  }
                            })));
      }

}

export type ProfileRequest = {
      name: string,
      gender: number,
      dob: string,
      avatar: ImageSpec
};