import {ImageEvent} from './image-event';

describe('ImageEvent', () => {
      it('parses server image event dto fields', () => {
            const raw = {
                  downloadUrl: 'https://cdn.example.com/image.png',
                  filename: 'image.png',
                  width: 640,
                  height: 480,
                  format: 'png'
            };

            const event = ImageEvent.from(raw);

            expect(event.downloadUrl).toBe(raw.downloadUrl);
            expect(event.filename).toBe(raw.filename);
            expect(event.width).toBe(raw.width);
            expect(event.height).toBe(raw.height);
            expect(event.format).toBe(raw.format);
      });

      it('parses legacy image spec shapes', () => {
            const raw = {
                  imageSpec: {
                        uri: 'https://legacy.example.com/image.jpg',
                        filename: 'image.jpg',
                        width: 320,
                        height: 200,
                        format: 'jpg'
                  }
            };

            const event = ImageEvent.from(raw);

            expect(event.downloadUrl).toBe(raw.imageSpec.uri);
            expect(event.filename).toBe(raw.imageSpec.filename);
            expect(event.width).toBe(raw.imageSpec.width);
            expect(event.height).toBe(raw.imageSpec.height);
            expect(event.format).toBe(raw.imageSpec.format);
      });
});