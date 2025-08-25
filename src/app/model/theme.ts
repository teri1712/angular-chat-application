import {ImageSpec} from './image-spec';

export class Theme {
      constructor(public id: number, public background: ImageSpec) {
      }

      static from(raw: any): Theme {
            const id = raw.id ?? 0;
            const background = raw.background ?? ImageSpec.from(raw.background);
            return new Theme(id, background);
      }
}
