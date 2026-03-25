import {Pipe, PipeTransform} from '@angular/core';
import {SendState} from "../../model/message";

@Pipe({
      name: 'sentmessages',
      standalone: true
})
export class SentMessagesPipe implements PipeTransform {

      constructor() {
      }

      transform<T extends SendFrame>(messages: T[] | null): T[] {
            if (!messages || messages.length === 0) return messages ?? [];
            let firstMet = false;
            for (let i = messages.length - 1; i >= 0; i--) {
                  const sent = messages[i]?.sent;
                  const mine = messages[i]?.mine;
                  if (mine && sent?.sendState == SendState.Sent)
                        if (!firstMet) {
                              firstMet = true;
                              sent.display = true;
                        } else {
                              sent.display = false;
                        }
            }
            return messages;
      }
}

export type SendFrame = {
      sent?: SendMessage,
      mine: boolean
}

export type SendMessage = {
      sendState: SendState
      display: boolean
}