export class IconEvent {
      constructor(public resourceId: number) {
      }

      static from(raw: any): IconEvent {
            const resourceId = raw.resourceId ?? 0;
            return new IconEvent(resourceId);
      }
}