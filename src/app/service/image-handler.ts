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
import {ImageState} from "../model/dto/image-state";

@Injectable()
export class ImageHandler extends EventHandler {


    constructor(private profileService: ProfileService, private readonly httpClient: HttpClient, private readonly uploadService: UploadService) {
        super();

    }

    override supports(posting: MessagePosting): boolean {
        return posting instanceof ImagePosting;
    }

    override mock(posting: MessagePosting): MessageState {
        const profile = this.profileService.profile()
        const imagePosting = posting as ImagePosting;
        const imageState: ImageState = {
            chatId: posting.chatId,
            postingId: posting.id,
            sender: new User(profile.id, profile.username, profile.name, profile.avatar),
            messageType: 'IMAGE',
            seenBy: [],
            sequenceNumber: generateSequenceNumber(),
            createdAt: new Date().toDateString(),
            updatedAt: new Date().toDateString(),
            image: {
                filename: imagePosting.file.name,
                uri: URL.createObjectURL(imagePosting.file),
                width: imagePosting.width,
                height: imagePosting.height,
                format: imagePosting.format
            }
        }
        return imageState;
    }

    override handle(posting: MessagePosting): Observable<any> {
        const imagePosting = posting as ImagePosting;
        const url = environment.API_URL + '/chats/' + encodeURIComponent(posting.chatId) + '/images/' + encodeURIComponent(posting.id);

        return this.uploadService.upload(imagePosting.file.name, imagePosting.file).pipe(
            switchMap(integrity => {
                return this.httpClient.put<MessageState>(url, {
                    filename: imagePosting.file.name,
                    file: integrity,
                    width: imagePosting.width,
                    height: imagePosting.height,
                    format: imagePosting.format
                }, {});
            })
        );
    }
}

export class ImagePosting extends MessagePosting {
    constructor(readonly file: File, readonly width: number, readonly height: number, readonly format: string, readonly chatId: string) {
        super();
    }
}
