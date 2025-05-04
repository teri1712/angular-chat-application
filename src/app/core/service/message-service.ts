import {Injectable, OnDestroy} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Conversation} from "../../model/conversation";
import {ChatEvent, ICON, IMAGE, SEEN, TEXT} from "../../model/chat-event";
import {TextEvent} from "../../model/text-event";
import {IconEvent} from "../../model/icon-event";
import {ImageEvent} from "../../model/image-event";
import {environment} from "../../environments";
import {AccountManager} from "./auth/account-manager";
import {SeenEvent} from "../../model/seen-event";

@Injectable()
export class MessageService implements OnDestroy {

      private queueState: 'idle' | 'sending' | 'pending' = 'idle';
      private queue: ChatEvent[] = [];
      private onOnline = () => {
            if (this.queueState === 'pending') {
                  this.queueState = 'idle';
                  this.schedule()
            }
      }

      private onConnectionLost() {
            if (navigator.onLine) {
                  this.queueState = 'idle';
                  this.schedule()
            } else {
                  this.queueState = 'pending';
            }
      }

      private onSent() {
            this.queueState = 'idle';
            this.queue.shift()
            this.schedule()
      }

      constructor(private httpClient: HttpClient, private accountManager: AccountManager) {
            window.addEventListener('online', this.onOnline);
      }

      ngOnDestroy(): void {
            window.removeEventListener('online', this.onOnline);
      }

      private prepare(event: ChatEvent) {
            switch (event.eventType) {
                  case TEXT:
                        event['content'] = event.textEvent?.content;
                        break
                  case IMAGE:
                        event['image'] = event.imageEvent?.imageSpec;
                        break
                  case ICON:
                        event['resourceId'] = event.iconEvent?.resourceId;
                        break
                  case SEEN                                                                                                                                     :
                        event['at'] = event.seenEvent?.at;
                        break
                  default:
                        window.alert("?")
                        break
            }
      }


      private schedule() {
            if (this.queueState != 'idle' || this.queue.length === 0) {
                  return
            }
            this.queueState = 'sending';
            const event = this.queue.at(0)!;
            this.prepare(event);
            switch (event.eventType) {
                  case TEXT:
                        this.httpClient.post(environment.API_URL + "/message/text", event, {
                              headers: {
                                    'Content-Type': 'application/json',
                              }
                        }).subscribe(
                                (res) => {
                                      this.onSent()
                                },
                                error => {
                                      if (error.status === 0) {
                                            this.onConnectionLost()
                                      }
                                      console.error(error);
                                      window.alert(error.message)
                                })
                        break
                  case IMAGE:
                        const formData = new FormData()
                        formData.append("event", new Blob([JSON.stringify(event)], {
                              type: 'application/json'
                        }));
                        formData.append("file", event.imageEvent!.file!)
                        this.httpClient.post(environment.API_URL + "/message/image", formData).subscribe(
                                (res) => {
                                      this.onSent()
                                },
                                error => {
                                      if (error.status === 0) {
                                            this.onConnectionLost()
                                      }
                                      console.error(error);
                                      window.alert(error.message)
                                })
                        break
                  case ICON:
                        this.httpClient.post(environment.API_URL + "/message/icon", event, {
                              headers: {
                                    'Content-Type': 'application/json',
                              }
                        }).subscribe(
                                (res) => {
                                      this.onSent()
                                },
                                error => {
                                      if (error.status === 0) {
                                            this.onConnectionLost()
                                      }
                                      console.error(error);
                                      window.alert(error.message)
                                })
                        break
                  case SEEN:
                        this.httpClient.post(environment.API_URL + "/message/seen", event, {
                              headers: {
                                    'Content-Type': 'application/json',
                              }
                        }).subscribe(
                                (res) => {
                                      this.onSent()
                                },
                                error => {
                                      if (error.status === 0) {
                                            this.onConnectionLost()
                                      }
                                      console.error(error);
                                      window.alert(error.message)
                                })
                        break
                  default:
                        window.alert("?")
                        break
            }
      }

      send(conversation: Conversation, message:
              TextEvent
              | IconEvent
              | ImageEvent
              | SeenEvent): void {

            const event = new ChatEvent();
            event.chatIdentifier = conversation.identifier;
            event.sender = conversation.owner.id;
            event.conversation = conversation;

            if (message instanceof TextEvent) {
                  event.textEvent = message;
                  event.eventType = TEXT
            } else if (message instanceof IconEvent) {
                  event.iconEvent = message;
                  event.eventType = ICON
            } else if (message instanceof ImageEvent) {
                  event.imageEvent = message;
                  event.eventType = IMAGE
            } else {
                  event.seenEvent = message;
                  event.eventType = SEEN
            }

            this.queue.push(event);
            this.schedule()

            this.accountManager.eventChannel.post(event);
      }

}