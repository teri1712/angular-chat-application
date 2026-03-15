import {Pipe, PipeTransform} from '@angular/core';
import {MessageFrame, Position} from "../format/Formatter";

export interface Framed {
      frame: MessageFrame;
}

@Pipe({
      name: 'grouping',
      standalone: true
})
export class GroupPipe implements PipeTransform {

      transform<T extends Framed>(messages: T[] | null): T[] {

            if (!messages || messages.length === 0) {
                  return messages ?? [];
            }

            const twoMin = 2 * 60 * 1000;

            const sameGroup = (a: MessageFrame, b: MessageFrame) => {
                  const diff = Math.abs(
                          a.receiveTime.getTime() - b.receiveTime.getTime()
                  );

                  return (
                          a.senderId === b.senderId &&
                          diff < twoMin &&
                          !a.forceSplit &&
                          !b.forceSplit
                  );
            };

            for (let i = 0; i < messages.length; i++) {

                  const cur = messages[i].frame;

                  const prev = i > 0 ? messages[i - 1].frame : null;
                  const next = i < messages.length - 1 ? messages[i + 1].frame : null;

                  const samePrev = prev ? sameGroup(prev, cur) : false;
                  const sameNext = next ? sameGroup(cur, next) : false;

                  if (!samePrev && !sameNext) {
                        cur.position = Position.Single;
                  } else if (!samePrev && sameNext) {
                        cur.position = Position.Top;
                  } else if (samePrev && sameNext) {
                        cur.position = Position.Center;
                  } else {
                        cur.position = Position.Bottom;
                  }

                  // show time only at start of a group
                  cur.displayTime = !samePrev;
            }

            return messages;
      }
}