import {Pipe, PipeTransform} from '@angular/core';
import {ONE_WEEK_MILLIS} from "../time";

@Pipe({
      name: 'formatTime',
      pure: false
})
export class FormatTimePipe implements PipeTransform {
      transform(value: number): string {
            const date = new Date(value);
            const now = new Date();
            const ageMs = now.getTime() - date.getTime();

            if (ageMs > ONE_WEEK_MILLIS) {
                  return new Intl.DateTimeFormat(undefined, {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                  })
                          .format(date)
                          .replace(/,/, '');
            }

            if (
                    date.getFullYear() !== now.getFullYear() ||
                    date.getMonth() !== now.getMonth() ||
                    date.getDate() !== now.getDate()
            ) {
                  return new Intl.DateTimeFormat(undefined, {
                        weekday: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                  }).format(date);
            }

            return new Intl.DateTimeFormat(undefined, {
                  hour: '2-digit',
                  minute: '2-digit'
            }).format(date);
      }
}