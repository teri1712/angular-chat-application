import {Injectable} from "@angular/core";
import {Previewer} from "./previewer";
import {MessageState} from "../../model/dto/message-state";
import {TextState} from "../../model/dto/text-state";

@Injectable({
    providedIn: 'root'
})
export class TextPreviewer implements Previewer {
    supports(messageType: string): boolean {
        return messageType.toLowerCase() === 'text';
    }

    preview(message: MessageState): string {
        return (message as TextState).content;
    }
}
