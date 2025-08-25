import {Message} from "../../model/message";

export interface Formatter {
      reformat(messageList: Message[]): void;

      format(messageList: Message[]): void;
}

