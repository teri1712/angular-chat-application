import {EventHandler} from "./event-handler";
import {generateSequenceNumber, MessageState} from "../model/dto/message-state";
import {Observable, switchMap} from "rxjs";
import {Injectable} from "@angular/core";
import {environment} from "../environments";
import {UploadService} from "./upload-service";
import {HttpClient} from "@angular/common/http";
import {MessagePosting} from "./message-service";
import {User} from "../model/dto/user";
import ProfileService from "./profile-service";
import {Profile} from "../model/dto/profile";
import {FileState} from "../model/dto/file-state";

@Injectable()
export class FileHandler extends EventHandler {

      private readonly profile: Profile;

      constructor(private profileService: ProfileService, private readonly httpClient: HttpClient, private readonly uploadService: UploadService) {
            super();
            this.profile = profileService.getProfile();
      }

      override supports(posting: MessagePosting): boolean {
            return posting instanceof FilePosting;
      }

      override mock(posting: MessagePosting): MessageState {
            const filePosting = posting as FilePosting;
            const fileState: FileState = {
                  chatId: posting.chatId,
                  sender: new User(this.profile.id, this.profile.username, this.profile.name, this.profile.avatar),
                  messageType: 'FILE',
                  seenBy: [],
                  sequenceNumber: generateSequenceNumber(),
                  createdAt: new Date().toDateString(),
                  updatedAt: new Date().toDateString(),
                  filename: filePosting.file.name,
                  uri: URL.createObjectURL(filePosting.file),
                  size: filePosting.file.size,
            }
            return fileState;
      }

      override handle(posting: MessagePosting): Observable<any> {
            const filePosting = posting as FilePosting;
            const url = environment.API_URL + '/chats/' + encodeURIComponent(posting.chatId) + '/file-events/' + encodeURIComponent(posting.id);

            return this.uploadService.upload(filePosting.file.name, filePosting.file).pipe(
                    switchMap(downloadUrl => {
                          return this.httpClient.put<MessageState>(url, {
                                filename: filePosting.file.name,
                                uri: downloadUrl.path,
                                size: filePosting.file.size
                          }, {});
                    })
            );
      }
}

export class FilePosting extends MessagePosting {
      constructor(readonly file: File, readonly chatId: string) {
            super();
      }
}
