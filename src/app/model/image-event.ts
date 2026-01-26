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

      static from(raw: any): ImageEvent {
            const imageSpecRaw = raw?.imageSpec ?? {};
            const downloadUrl = raw?.downloadUrl
                    ?? raw?.uri
                    ?? imageSpecRaw.downloadUrl
                    ?? imageSpecRaw.uri
                    ?? "";
            const filename = raw?.filename ?? imageSpecRaw.filename ?? "";
            const width = typeof raw?.width === 'number'
                    ? raw.width
                    : (typeof imageSpecRaw.width === 'number' ? imageSpecRaw.width : 0);
            const height = typeof raw?.height === 'number'
                    ? raw.height
                    : (typeof imageSpecRaw.height === 'number' ? imageSpecRaw.height : 0);
            const format = raw?.format ?? imageSpecRaw.format ?? "jpg";
            return new ImageEvent(downloadUrl, filename, width, height, format);
      }
}