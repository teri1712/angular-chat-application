import {ChatEvent, FILE, ICON, IMAGE, SEEN, TEXT} from '../../model/chat-event';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments';
import {TextEvent} from '../../model/text-event';
import {IconEvent} from '../../model/icon-event';
import {ImageEvent} from '../../model/image-event';
import {SeenEvent} from '../../model/seen-event';
import {FileEvent} from '../../model/file-event';

type PresignedUpload = {
      presignedUploadUrl: string;
      downloadUrl: string;
};

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
            const url = environment.API_URL + '/chats/' + encodeURIComponent(event.chatIdentifier.toString()) + '/text-events';
            http
                    .post(url, event.textEvent, {
                          headers: {
                                'Content-Type': 'application/json',
                                'Idempotency-key': event.id
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
            const url = environment.API_URL + '/chats/' + encodeURIComponent(event.chatIdentifier.toString()) + '/icon-events';
            http
                    .post(url, event.iconEvent, {
                          headers: {
                                'Content-Type': 'application/json',
                                'Idempotency-key': event.id
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
            const url = environment.API_URL + '/chats/' + encodeURIComponent(event.chatIdentifier.toString()) + '/seen-events';
            const atValue = event.seenEvent?.at ?? Date.now();
            const body = {
                  at: new Date(atValue).toISOString()
            };
            http
                    .post(url, body, {
                          headers: {
                                'Content-Type': 'application/json',
                                'Idempotency-key': event.id
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
            event['image'] = event.imageEvent;
      }

      send(http: HttpClient, event: ChatEvent, onSent: () => void, onConnectionLost: () => void): void {
            const imageEvent = event.imageEvent;
            const url = environment.API_URL + '/chats/' + encodeURIComponent(event.chatIdentifier.toString()) + '/image-events';
            const sendEvent = (downloadUrl: string) => {
                  if (imageEvent) {
                        imageEvent.downloadUrl = downloadUrl;
                  }
                  const body = {
                        downloadUrl: downloadUrl,
                        filename: imageEvent?.filename ?? '',
                        width: imageEvent?.width ?? 0,
                        height: imageEvent?.height ?? 0,
                        format: imageEvent?.format ?? ''
                  };
                  http
                          .post(url, body, {
                                headers: {
                                      'Content-Type': 'application/json',
                                      'Idempotency-key': event.id
                                },
                          })
                          .subscribe(
                                  () => {
                                        onSent();
                                  },
                                  (error) => {
                                        if (error.status === 0) {
                                              onConnectionLost();
                                        }
                                        console.error(error);

                                  }
                          );
            };

            const file = event.imageEvent?.file;
            if (!file) {
                  sendEvent(imageEvent?.downloadUrl ?? '');
                  return;
            }

            const filename = imageEvent?.filename || file.name;
            const presignUrl = environment.API_URL + '/files/upload-urls?filename=' + encodeURIComponent(filename);
            http.get<PresignedUpload>(presignUrl, {observe: 'body'}).subscribe(
                    (presigned) => {
                          fetch(presigned.presignedUploadUrl, {
                                method: 'PUT',
                                body: file,
                                headers: {
                                      'Content-Type': 'application/octet-stream'
                                }
                          })
                                  .then((response) => {
                                        if (!response.ok) {
                                              throw new Error(`Upload failed: ${response.status}`);
                                        }
                                        sendEvent(presigned.downloadUrl ?? '');
                                  })
                                  .catch((error) => {
                                        if (!navigator.onLine) {
                                              onConnectionLost();
                                        }
                                        console.error(error);
                                  });
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
            const url = environment.API_URL + '/chats/' + encodeURIComponent(event.chatIdentifier.toString()) + '/file-events';
            const sendEvent = (downloadUrl: string) => {
                  if (event.fileEvent) {
                        event.fileEvent.mediaUrl = downloadUrl;
                  }
                  const body = {
                        filename: event.fileEvent?.filename ?? '',
                        size: event.fileEvent?.size ?? 0,
                        mediaUrl: downloadUrl
                  };
                  http
                          .post(url, body, {
                                headers: {
                                      'Content-Type': 'application/json',
                                      'Idempotency-key': event.id
                                },
                          })
                          .subscribe(
                                  () => {
                                        onSent();
                                  },
                                  (error) => {
                                        if (error.status === 0) {
                                              onConnectionLost();
                                        }
                                        console.error(error);

                                  }
                          );
            };

            const file = event.fileEvent?.file;
            if (!file) {
                  sendEvent(event.fileEvent?.mediaUrl ?? '');
                  return;
            }

            const filename = event.fileEvent?.filename || file.name;
            const presignUrl = environment.API_URL + '/files/upload-urls?filename=' + encodeURIComponent(filename);
            http.get<PresignedUpload>(presignUrl, {observe: 'body'}).subscribe(
                    (presigned) => {
                          fetch(presigned.presignedUploadUrl, {
                                method: 'PUT',
                                body: file,
                                headers: {
                                      'Content-Type': 'application/octet-stream'
                                }
                          })
                                  .then((response) => {
                                        if (!response.ok) {
                                              throw new Error(`Upload failed: ${response.status}`);
                                        }
                                        sendEvent(presigned.downloadUrl ?? '');
                                  })
                                  .catch((error) => {
                                        if (!navigator.onLine) {
                                              onConnectionLost();
                                        }
                                        console.error(error);
                                  });
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
