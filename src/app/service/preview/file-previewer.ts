import {Injectable} from "@angular/core";
import {Previewer} from "./previewer";
import {MessageState} from "../../model/dto/message-state";

@Injectable({
    providedIn: 'root'
})
export class FilePreviewer implements Previewer {
    supports(messageType: string): boolean {
        return messageType.toLowerCase() === 'file';
    }

    preview(message: MessageState): string {
        return "has sent a file";
    }
}
