export class IconEvent {
      constructor(public resourceId: number) {
      }

      static from(raw: any): IconEvent {
            const resourceId = typeof raw.resourceId === 'number' ? raw.resourceId : 0;
            return new IconEvent(resourceId);
      }
}