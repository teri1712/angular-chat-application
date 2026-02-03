import {Position} from "../../model/IMessage";
import {Formatter} from "../format/Formatter";
import {Message} from "./message";

export class RollInFormatter implements Formatter {

      reformat(messageList: Message[]): Message[] {
            const twoMin = 2 * 60 * 1000;
            if (messageList.length === 0) return messageList;

            const size = messageList.length;
            const first = messageList[0];

            first.position = Position.Single;
            if (size === 1) {
                  return messageList;
            }

            for (let i = 0; i < size - 1; i++) {
                  const cur = messageList[i];
                  const above = messageList[i + 1];
                  cur.fixedDisplayTime =
                          cur.receiveTime.getTime() - above.receiveTime.getTime() >= twoMin && cur.sender === above.sender;
                  if (cur.iconEvent != null) break;
                  if (
                          cur.receiveTime.getTime() - above.receiveTime.getTime() >= twoMin ||
                          cur.sender !== above.sender ||
                          above.iconEvent != null
                  ) {
                        break;
                  }
                  if (cur.position === Position.Single) {
                        cur.position = Position.Bottom;
                  } else {
                        cur.position = Position.Center;
                  }
                  above.position = Position.Top;
            }

            const last = messageList[size - 1];
            last.position = Position.Single;
            last.fixedDisplayTime = true;

            for (let i = size - 1; i >= 1; i--) {
                  const cur = messageList[i];
                  const below = messageList[i - 1];
                  below.fixedDisplayTime =
                          below.receiveTime.getTime() - cur.receiveTime.getTime() >= twoMin && cur.sender === below.sender;
                  if (cur.iconEvent != null) break;
                  if (
                          below.receiveTime.getTime() - cur.receiveTime.getTime() >= twoMin ||
                          cur.sender !== below.sender ||
                          below.iconEvent != null
                  ) {
                        break;
                  }
                  if (cur.position === Position.Single) {
                        cur.position = Position.Top;
                  } else {
                        cur.position = Position.Center;
                  }
                  below.position = Position.Bottom;
            }
            return messageList;
      }

      format(messageList: Message[]): Message[] {
            for (let i = 1; i <= messageList.length; i++) {
                  this.reformat(messageList.slice(0, i));
            }
            return messageList;
      }
}
