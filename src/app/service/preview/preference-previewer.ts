import {Injectable} from "@angular/core";
import {Previewer} from "./previewer";
import {MessageState} from "../../model/dto/message-state";

@Injectable({
    providedIn: 'root'
})
export class PreferencePreviewer implements Previewer {
    supports(messageType: string): boolean {
        return messageType.toLowerCase() === 'preference';
    }

    preview(message: MessageState): string {
        return "has updated preferences";
    }
}
