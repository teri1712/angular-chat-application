import {EventHandler} from "./event-handler";
import {generateSequenceNumber, MessageState} from "../model/dto/message-state";
import {Observable} from "rxjs";
import {Injectable} from "@angular/core";
import {MessagePosting} from "./message-service";
import {TextState} from "../model/dto/text-state";
import {User} from "../model/dto/user";
import ProfileService from "./profile-service";
import {HttpClient} from "@angular/common/http";
import {environment} from "../environments";

@Injectable()
export class TextHandler extends EventHandler {


    constructor(private profileService: ProfileService, private readonly httpClient: HttpClient) {
        super();

    }

    override supports(posting: MessagePosting): boolean {
        return posting instanceof TextPosting;
    }

    override mock(posting: MessagePosting): MessageState {
        const profile = this.profileService.profile()
        const textPosting = posting as TextPosting;
        const textState: TextState = {
            chatId: posting.chatId,
            postingId: posting.id,
            sender: new User(profile.id, profile.username, profile.name, profile.avatar),
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
        return this.httpClient.put<MessageState>(environment.API_URL + "/chats/" + encodeURIComponent(posting.chatId) + "/texts/" + encodeURIComponent(posting.id), {
            content: textPosting.content,
        }, {});
    }

}

export class TextPosting extends MessagePosting {
    constructor(readonly content: string, readonly chatId: string) {
        super();
    }
}