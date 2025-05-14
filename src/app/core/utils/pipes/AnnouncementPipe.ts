import {Pipe, PipeTransform} from '@angular/core';
import {Message} from "../../../model/message";
import {Conversation} from '../../../model/conversation';
import {ONE_DAY_SECONDS, ONE_HOUR_SECONDS, ONE_MINUTE_SECONDS, ONE_WEEK_SECONDS} from "../time";

@Pipe({
      name: 'announcement',
      pure: true,
})
export class AnnouncementPipe implements PipeTransform {

      transform(newest: Message,
                conversation: Conversation): string {

            const mine = newest.sender === conversation.owner.id;

            let content: string;
            if (newest.imageEvent) {
                  content = 'has sent an image';
            } else if (newest.iconEvent) {
                  content = 'has sent an icon';
            } else if (newest.textEvent) {
                  content = newest.textEvent.content;
            } else {
                  content = '';
            }

            // Append relative time using the already-defined pipe
            content += ' · ' + this.formatTime(newest.receiveTime);

            const subject = mine ? 'You' : conversation.partner.name;
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