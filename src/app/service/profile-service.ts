import {Injectable} from "@angular/core";
import {User} from "../model/dto/user";
import {AccountRepository} from "./auth/account-repository";
import {BehaviorSubject, Observable, switchMap, tap} from "rxjs";
import {environment} from "../environments";
import {HttpClient} from "@angular/common/http";
import {UploadService} from "./upload-service";
import {ImageSpec} from "../model/dto/image-spec";

@Injectable()
export default class ProfileService {

      private readonly profile: BehaviorSubject<User>;

      constructor(accountRepository: AccountRepository, private readonly httpClient: HttpClient, private readonly uploadService: UploadService) {
            this.profile = new BehaviorSubject<User>(accountRepository.currentUser!);
      }

      getProfileObservable(): Observable<User> {
            return this.profile.asObservable();
      }

      getProfile(): User {
            return this.profile.value;
      }

      updateProfile(user: Partial<ProfileRequest>): Observable<User> {
            return this.httpClient.put<User>(environment.API_URL + "/accounts/me/profile", user).pipe(
                    tap(updatedUser => {
                                  this.profile.next(updatedUser);
                            }
                    )
            );
      }

      updateAvatar(file: File): Observable<User> {
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