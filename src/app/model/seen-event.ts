export class SeenEvent {
      constructor(public at: number,) {
      }

      static from(raw: any): SeenEvent {
            const at = typeof raw.at === 'number' ? raw.at : Date.now();
            return new SeenEvent(at);
      }
}