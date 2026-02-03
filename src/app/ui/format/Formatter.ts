import {IMessage} from "../../model/IMessage";

export interface Formatter {
      reformat(messageList: IMessage[]): IMessage[];

      format(messageList: IMessage[]): IMessage[];
}

