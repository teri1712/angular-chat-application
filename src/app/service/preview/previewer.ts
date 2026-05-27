import {InjectionToken} from "@angular/core";
import {MessageState} from "../../model/dto/message-state";

export interface Previewer {
    supports(messageType: string): boolean;
    preview(message: MessageState): string;
}

export const PREVIEWER = new InjectionToken<Previewer[]>('PREVIEWER');
