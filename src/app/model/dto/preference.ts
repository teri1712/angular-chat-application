import {Theme} from './theme';

export class Preference {
      constructor(
              public iconId: number = 1,
              public roomName: string = '',
              public theme: Theme | undefined = undefined
      ) {
      }

}
