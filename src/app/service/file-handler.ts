import {EventHandler} from "./event-handler";
import {ChatEvent} from "../model/dto/chat-event";
import {Observable, switchMap} from "rxjs";
import {Injectable} from "@angular/core";
import {environment} from "../environments";
import {toIdString} from "../model/dto/chat-identifier";
import {UploadService} from "./upload-service";
import {HttpClient} from "@angular/common/http";

@Injectable()
export class FileHandler extends EventHandler {

      constructor(http: HttpClient, private readonly uploadService: UploadService) {
            super(http);
      }

      handle(event: ChatEvent): Observable<ChatEvent> {
            const chat = event.chat;
            const chatIdentifier = chat.identifier;
            const url = environment.API_URL + '/chats/' + encodeURIComponent(toIdString(chatIdentifier)) + '/file-events';

            const fileEvent = event.fileEvent!;
            return this.uploadService.upload(fileEvent.filename, fileEvent.file!).pipe(
                    switchMap(downloadUrl => {
                          fileEvent.mediaUrl = downloadUrl.path;
                          return this.http.post<ChatEvent>(url, fileEvent, {
                                headers: {
                                      'Content-Type': 'application/json',
                                      'Idempotency-key': event.idempotencyKey
                                },
                          });
                    })
            );
      }

      supports(event: ChatEvent): boolean {
            return !!event.fileEvent;
      }
}
