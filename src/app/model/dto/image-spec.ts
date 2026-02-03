export class ImageSpec {
      

      constructor(
              public uri: string = "",
              public filename: string = "",
              public width: number = 500,
              public height: number = 500,
              public format: string = "jpg",
      ) {
      }
}