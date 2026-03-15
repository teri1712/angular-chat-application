import {EventHandler} from "./event-handler";
import {MessageState} from "../model/dto/message-state";
import {Observable} from "rxjs";
import {Injectable} from "@angular/core";
import {environment} from "../environments";
import {HttpClient} from "@angular/common/http";
import {MessagePosting} from "./message-service";
import ProfileService from "./profile-service";
import {Profile} from "../model/dto/profile";

@Injectable()
export class SeenHandler extends EventHandler {

      private readonly profile: Profile;

      constructor(private profileService: ProfileService, private readonly httpClient: HttpClient) {
            super();
            this.profile = profileService.getProfile();
      }

      override supports(posting: MessagePosting): boolean {
            return posting instanceof SeenPosting;
      }

      override mock(posting: MessagePosting): MessageState | null {
            return null
      }

      override handle(posting: MessagePosting): Observable<any> {
            const seenPosting = posting as SeenPosting;
            const url = environment.API_URL + '/chats/' + encodeURIComponent(posting.chatId) + '/seen-events/' + encodeURIComponent(posting.id);
            return this.httpClient
                    .put<MessageState>(url, {
                          at: seenPosting.at
                    }, {});
      }
}

export class SeenPosting extends MessagePosting {
      constructor(readonly at: Date, readonly chatId: string) {
            super();
      }
}
