import {Injectable} from "@angular/core";
import {Previewer} from "./previewer";
import {MessageState} from "../../model/dto/message-state";

@Injectable({
    providedIn: 'root'
})
export class ImagePreviewer implements Previewer {
    supports(messageType: string): boolean {
        return messageType.toLowerCase() === 'image';
    }

    preview(message: MessageState): string {
        return "has sent an image";
    }
}
