import {Pipe, PipeTransform} from '@angular/core';
import {SendState} from "../../model/message";

@Pipe({
    name: 'mymessages',
    standalone: true
})
export class MymessagesPipe implements PipeTransform {

    constructor() {
    }

    transform<T extends SendFrame>(messages: T[] | null): T[] {
        if (!messages || messages.length === 0) return messages ?? [];
        let firstMet = false;
        for (let i = messages.length - 1; i >= 0; i--) {
            const myMessageFrame = messages[i]?.myMessageFrame;
            if (myMessageFrame) {

                if (myMessageFrame?.sendState == SendState.Error) {
                    myMessageFrame.display = true;
                    continue
                }
                if (!firstMet) {
                    firstMet = true;
                    myMessageFrame.display = true;
                } else {
                    myMessageFrame.display = false;
                }
            }
        }
        return messages;
    }
}

export type SendFrame = {
    myMessageFrame?: MyMessageFrame
}

export type MyMessageFrame = {
    sendState: SendState
    display: boolean
}