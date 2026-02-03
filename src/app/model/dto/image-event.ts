export class ImageEvent {
      constructor(
              public downloadUrl: string,
              public filename: string,
              public width: number,
              public height: number,
              public format: string,
      ) {
      }

      public file?: File

}