import {EventHandler} from "./event-handler";
import {generateSequenceNumber, MessageState} from "../model/dto/message-state";
import {Observable} from "rxjs";
import {Injectable} from "@angular/core";
import {MessagePosting} from "./message-service";
import {TextState} from "../model/dto/text-state";
import {User} from "../model/dto/user";
import {Profile} from "../model/dto/profile";
import ProfileService from "./profile-service";
import {HttpClient} from "@angular/common/http";
import {environment} from "../environments";

@Injectable()
export class TextHandler extends EventHandler {

      private readonly profile: Profile;

      constructor(private profileService: ProfileService, private readonly httpClient: HttpClient) {
            super();
            this.profile = profileService.getProfile();
      }

      override supports(posting: MessagePosting): boolean {
            return posting instanceof TextPosting;
      }

      override mock(posting: MessagePosting): MessageState {
            const textPosting = posting as TextPosting;
            const textState: TextState = {
                  chatId: posting.chatId,
                  sender: new User(this.profile.id, this.profile.username, this.profile.name, this.profile.avatar),
                  messageType: 'TEXT',
                  seenBy: [],
                  sequenceNumber: generateSequenceNumber(),
                  createdAt: new Date().toDateString(),
                  updatedAt: new Date().toDateString(),
                  content: textPosting.content,
            }
            return textState;
      }

      override handle(posting: MessagePosting): Observable<any> {
            const textPosting = posting as TextPosting;
            return this.httpClient.put<MessageState>(environment.API_URL + "/chats/" + encodeURIComponent(posting.chatId) + "/text-events/" + encodeURIComponent(posting.id), {
                  content: textPosting.content,
            }, {});
      }

}

export class TextPosting extends MessagePosting {
      constructor(readonly content: string, readonly chatId: string) {
            super();
      }
}