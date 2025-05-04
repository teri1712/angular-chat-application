export const ONE_MINUTE_SECONDS = 60;
export const ONE_HOUR_SECONDS = ONE_MINUTE_SECONDS * 60;
export const ONE_DAY_SECONDS = ONE_HOUR_SECONDS * 24;
export const ONE_WEEK_SECONDS = ONE_DAY_SECONDS * 24;
export const ONE_WEEK_MILLIS = 7 * 24 * 60 * 60 * 1000;

export function formatRelativeTime(timestamp: number): string {
      const now = Date.now();
      const diffMs = timestamp - now;
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

export function formatTime(timestamp: number): string {
      const date = new Date(timestamp);
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
