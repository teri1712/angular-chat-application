export class ImageSpec {


      static from(raw: any): ImageSpec {
            const uri = raw.uri ?? "";
            const filename = raw.filename ?? "";
            const width = typeof raw.width === 'number' ? raw.width : 0;
            const height = typeof raw.height === 'number' ? raw.height : 0;
            return new ImageSpec(uri, filename, width, height);
      }

      constructor(
              public uri: string = "",
              public filename: string = "",
              public width: number = 500,
              public height: number = 500,
      ) {
      }
}