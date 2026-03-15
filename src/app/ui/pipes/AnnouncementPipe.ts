import {Injectable} from '@angular/core';
import {ONE_DAY_SECONDS, ONE_HOUR_SECONDS, ONE_MINUTE_SECONDS, ONE_WEEK_SECONDS} from "../../utils/time";
import {MessageState} from "../../model/dto/message-state";

@Injectable({
      providedIn: 'root'
})
export class AnnouncementService {

      transform(newest: MessageState): string {

            const mine = newest.sender === newest.owner.id;

            let content: string;
            if (newest.imageEvent) {
                  content = 'has sent an image';
            } else if (newest.iconEvent) {
                  content = 'has sent an icon';
            } else if (newest.textEvent) {
                  content = newest.textEvent.content;
            } else if (newest.fileEvent) {
                  content = 'has sent a file';
            } else {
                  content = '';
            }

            // Append relative time using the already-defined pipe
            content += ' · ' + this.formatTime(new Date(newest.createdTime).getTime());

            const subject = mine ? 'You' : newest.partner.name;
            const separator = newest.textEvent ? ' : ' : ' ';

            return `${subject}${separator}${content}`;
      }


      private formatTime(value: number): string {

            const now = Date.now();
            const diffMs = value - now;
            const diffSeconds = Math.round(diffMs / 1000);

            const rtf = new Intl.RelativeTimeFormat(undefined, {numeric: 'auto'});

            if (Math.abs(diffSeconds) < ONE_MINUTE_SECONDS) {
                  return rtf.format(diffSeconds, 'second');
            }
            const diffMinutes = Math.round(diffSeconds / ONE_MINUTE_SECONDS);
            if (Math.abs(diffMinutes) < 60) {
                  return rtf.format(diffMinutes, 'minute');
            }

            const diffHours = Math.round(diffSeconds / ONE_HOUR_SECONDS);
            if (Math.abs(diffHours) < 24) {
                  return rtf.format(diffHours, 'hour');
            }

            const diffDays = Math.round(diffSeconds / ONE_DAY_SECONDS);
            if (Math.abs(diffDays) < 7) {
                  return rtf.format(diffDays, 'day');
            }

            const diffWeeks = Math.round(diffSeconds / ONE_WEEK_SECONDS);
            return rtf.format(diffWeeks, 'week');
      }
}