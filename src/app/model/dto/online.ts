import {ImageSpec} from "./image-spec";

export class Online {

      constructor(
              public userId: string,
              public username: string,
              public at: string,
              public name: string,
              public avatar: ImageSpec,
      ) {
      }
}