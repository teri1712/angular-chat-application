import {ImageSpec} from "./image-spec";

export class ImageEvent {
      constructor(public imageSpec: ImageSpec) {
      }

      public file?: File

      static from(raw: any): ImageEvent {
            const imageSpec = raw.imageSpec
                    ? ImageSpec.from(raw.imageSpec)
                    : new ImageSpec();
            return new ImageEvent(imageSpec);
      }
}