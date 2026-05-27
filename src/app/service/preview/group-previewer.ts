import {Injectable} from "@angular/core";
import {Previewer} from "./previewer";
import {MessageState} from "../../model/dto/message-state";

@Injectable({
    providedIn: 'root'
})
export class GroupPreviewer implements Previewer {
    supports(messageType: string): boolean {
        return messageType.toLowerCase() === 'group';
    }

    preview(message: MessageState): string {
        return "has created the room";
    }
}
