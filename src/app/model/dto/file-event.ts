export class FileEvent {
      constructor(public mediaUrl: string, public filename: string, public size: number) {

      }

      public file?: File

      static from(raw: any): FileEvent {
            return new FileEvent(raw.mediaUrl, raw.filename, raw.size);
      }
}