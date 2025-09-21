import {ChatEvent, FILE, ICON, IMAGE, SEEN, TEXT} from '../../model/chat-event';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments';
import {TextEvent} from '../../model/text-event';
import {IconEvent} from '../../model/icon-event';
import {ImageEvent} from '../../model/image-event';
import {SeenEvent} from '../../model/seen-event';
import {FileEvent} from '../../model/file-event';

export interface EventHandlerStrategy {
      configureEvent(event: ChatEvent): void;

      prepare(event: ChatEvent): void;

      send(
              http: HttpClient,
              event: ChatEvent,
              onSent: () => void,
              onConnectionLost: () => void
      ): void;
}

export class TextEventHandlerStrategy implements EventHandlerStrategy {
      constructor(private readonly message: TextEvent) {
      }

      configureEvent(event: ChatEvent): void {
            event.textEvent = this.message;
            event.eventType = TEXT;
      }

      prepare(event: ChatEvent): void {
            event['content'] = event.textEvent?.content;
      }

      send(http: HttpClient, event: ChatEvent, onSent: () => void, onConnectionLost: () => void): void {
            http
                    .post(environment.API_URL + '/events', event, {
                          headers: {
                                'Content-Type': 'application/json',
                          },
                    })
                    .subscribe(
                            (res) => {
                                  onSent();
                            },
                            (error) => {
                                  if (error.status === 0) {
                                        onConnectionLost();
                                  }
                                  console.error(error);

                            }
                    );
      }
}

export class IconEventHandlerStrategy implements EventHandlerStrategy {
      constructor(private readonly message: IconEvent) {
      }

      configureEvent(event: ChatEvent): void {
            event.iconEvent = this.message;
            event.eventType = ICON;
      }

      prepare(event: ChatEvent): void {
            event['resourceId'] = event.iconEvent?.resourceId;
      }

      send(http: HttpClient, event: ChatEvent, onSent: () => void, onConnectionLost: () => void): void {
            http
                    .post(environment.API_URL + '/events', event, {
                          headers: {
                                'Content-Type': 'application/json',
                          },
                    })
                    .subscribe(
                            (res) => {
                                  onSent();
                            },
                            (error) => {
                                  if (error.status === 0) {
                                        onConnectionLost();
                                  }
                                  console.error(error);

                            }
                    );
      }
}

export class SeenEventHandlerStrategy implements EventHandlerStrategy {
      constructor(private readonly message: SeenEvent) {
      }

      configureEvent(event: ChatEvent): void {
            event.seenEvent = this.message;
            event.eventType = SEEN;
      }

      prepare(event: ChatEvent): void {
            event['at'] = event.seenEvent?.at;
      }

      send(http: HttpClient, event: ChatEvent, onSent: () => void, onConnectionLost: () => void): void {
            http
                    .post(environment.API_URL + '/events', event, {
                          headers: {
                                'Content-Type': 'application/json',
                          },
                    })
                    .subscribe(
                            (res) => {
                                  onSent();
                            },
                            (error) => {
                                  if (error.status === 0) {
                                        onConnectionLost();
                                  }
                                  console.error(error);

                            }
                    );
      }
}

export class ImageEventHandlerStrategy implements EventHandlerStrategy {
      constructor(private readonly message: ImageEvent) {
      }

      configureEvent(event: ChatEvent): void {
            event.imageEvent = this.message;
            event.eventType = IMAGE;
      }

      prepare(event: ChatEvent): void {
            event['image'] = event.imageEvent?.imageSpec;
      }

      send(http: HttpClient, event: ChatEvent, onSent: () => void, onConnectionLost: () => void): void {
            const formData = new FormData();
            formData.append('event', new Blob([JSON.stringify(event)], {
                  type: 'application/json',
            }));
            formData.append('file', this.message.file!);
            http
                    .post(environment.API_URL + '/events', formData, {
                          headers: {
                                'X-File-Type': 'image',
                          },
                    })
                    .subscribe(
                            (res) => {
                                  onSent();
                            },
                            (error) => {
                                  if (error.status === 0) {
                                        onConnectionLost();
                                  }
                                  console.error(error);

                            }
                    );
      }
}

export class FileEventHandlerStrategy implements EventHandlerStrategy {
      constructor(private readonly message: FileEvent) {
      }

      configureEvent(event: ChatEvent): void {
            event.fileEvent = this.message;
            event.eventType = FILE;
      }

      prepare(event: ChatEvent): void {
            event['size'] = event.fileEvent?.size;
            event['filename'] = event.fileEvent?.filename;
      }

      send(http: HttpClient, event: ChatEvent, onSent: () => void, onConnectionLost: () => void): void {
            const formData = new FormData();
            formData.append('event', new Blob([JSON.stringify(event)], {
                  type: 'application/json',
            }));
            formData.append('file', this.message.file!);
            http
                    .post(environment.API_URL + '/events', formData, {
                          headers: {
                                'X-File-Type': 'file',
                          },
                    })
                    .subscribe(
                            (res) => {
                                  onSent();
                            },
                            (error) => {
                                  if (error.status === 0) {
                                        onConnectionLost();
                                  }
                                  console.error(error);

                            }
                    );
      }
}
