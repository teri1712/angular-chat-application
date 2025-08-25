import {Message, Position} from "../../model/message";
import {Formatter} from "./Formatter";

export class RollInFormatter implements Formatter {

      reformat(messageList: Message[]): void {
            const twoMin = 2 * 60 * 1000;
            if (messageList.length === 0) return;

            const size = messageList.length;
            const first = messageList[0];

            first.position = Position.Single;
            if (size === 1) {
                  return;
            }

            for (let i = 0; i < size - 1; i++) {
                  const cur = messageList[i];
                  const above = messageList[i + 1];
                  cur.fixedDisplayTime =
                          cur.receiveTime - above.receiveTime >= twoMin && cur.sender === above.sender;
                  if (cur.iconEvent != null) break;
                  if (
                          cur.receiveTime - above.receiveTime >= twoMin ||
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
                          below.receiveTime - cur.receiveTime >= twoMin && cur.sender === below.sender;
                  if (cur.iconEvent != null) break;
                  if (
                          below.receiveTime - cur.receiveTime >= twoMin ||
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
      }

      format(messageList: Message[]): void {
            for (let i = 1; i <= messageList.length; i++) {
                  this.reformat(messageList.slice(0, i));
            }
      }
}
