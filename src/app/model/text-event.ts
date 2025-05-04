export class TextEvent {
      constructor(public content: string) {
      }

      static from(raw: any): TextEvent {
            return new TextEvent(raw.content ?? "");
      }
}