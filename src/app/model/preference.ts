import {Theme} from './theme';

export class Preference {
      constructor(
              public resourceId: number = 0,
              public roomName: string = '',
              public theme: Theme | undefined = undefined
      ) {
      }

      static from(raw: any): Preference {
            const resourceId = raw.resourceId ?? 0;
            const roomName = raw.roomName ?? '';
            const theme = raw.theme
                    ? Theme.from(raw.theme)
                    : (raw.themeId != null ? Theme.from({id: raw.themeId}) : undefined);
            return new Preference(resourceId, roomName, theme);
      }
}
