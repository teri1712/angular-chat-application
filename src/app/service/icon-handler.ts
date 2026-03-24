import {EventHandler} from "./event-handler";
import {generateSequenceNumber, MessageState} from "../model/dto/message-state";
import {Observable} from "rxjs";
import {Injectable} from "@angular/core";
import {environment} from "../environments";
import {HttpClient} from "@angular/common/http";
import {MessagePosting} from "./message-service";
import {IconState} from "../model/dto/icon-state";
import {User} from "../model/dto/user";
import ProfileService from "./profile-service";
import {Profile} from "../model/dto/profile";

@Injectable()
export class IconHandler extends EventHandler {

      private readonly profile: Profile;

      constructor(private profileService: ProfileService, private readonly httpClient: HttpClient) {
            super();
            this.profile = profileService.getProfile();
      }

      override supports(posting: MessagePosting): boolean {
            return posting instanceof IconPosting;
      }

      override mock(posting: MessagePosting): MessageState {
            const iconPosting = posting as IconPosting;
            const iconState: IconState = {
                  chatId: posting.chatId,
                  postingId: posting.id,
                  sender: new User(this.profile.id, this.profile.username, this.profile.name, this.profile.avatar),
                  messageType: 'ICON',
                  seenBy: [],
                  sequenceNumber: generateSequenceNumber(),
                  createdAt: new Date().toDateString(),
                  updatedAt: new Date().toDateString(),
                  iconId: iconPosting.iconId,
            }
            return iconState;
      }

      override handle(posting: MessagePosting): Observable<any> {
            const iconPosting = posting as IconPosting;
            const url = environment.API_URL + '/chats/' + encodeURIComponent(posting.chatId) + '/icons/' + encodeURIComponent(posting.id);
            return this.httpClient
                    .put<MessageState>(url, {
                          iconId: iconPosting.iconId
                    }, {});
      }
}

export class IconPosting extends MessagePosting {
      constructor(readonly iconId: number, readonly chatId: string) {
            super();
      }
}
