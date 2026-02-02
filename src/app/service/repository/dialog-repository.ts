import {Injectable, OnDestroy} from "@angular/core";
import {ListRepository} from "./repository";
import {IDialog} from "../../model/IDialog";
import {ChatRepository} from "./chat-repository";
import {Conversation} from "../../model/dto/conversation";
import {map, Observable, of, Subscription, tap} from "rxjs";
import {ChatSnapshot} from "../../model/dto/chat-snapshot";
import {OnlineRepository} from "./online-repository";
import {ChatIdentifier, toIdString} from "../../model/dto/chat-identifier";
import {ChatEvent, getConversation, isPendingEvent} from "../../model/dto/chat-event";
import {AnnouncementService} from "../../ui/pipes/AnnouncementPipe";
import {Preference} from "../../model/dto/preference";
import {RealtimeClient} from "../websocket/realtime-client.service";
import ProfileService from "../profile-service";
import {User} from "../../model/dto/user";

@Injectable()
export class DialogRepository implements ListRepository<Conversation, IDialog>, OnDestroy {

      private readonly me: User;
      private dialogMap = new Map<string, Dialog>();

      private readonly eventSub: Subscription;
      private readonly eventObserver = (event: ChatEvent) => {
            const conversation = getConversation(event);
            const dialog = this.find(conversation) as Dialog;
            dialog.conversation = conversation;

            const real = !isPendingEvent(event)

            dialog.ghost = !real;
            if (event.message) {
                  dialog.newestFrom = event.sender;
                  dialog.newest = this.announcementService.transform(event);
                  dialog.seen = false;
            } else if (real) {
                  if (event.eventType === "SEEN") {
                        if (dialog.newest && dialog.newestFrom !== event.sender)
                              dialog.seen = true;
                  } else if (event.eventType === "PREFERENCE")
                        dialog.preference = event.preferenceEvent?.preference;
            }

      }


      constructor(
              private profileService: ProfileService,
              private chatRepo: ChatRepository,
              private realtimeClient: RealtimeClient,
              private onlineRepo: OnlineRepository,
              private announcementService: AnnouncementService,
      ) {
            this.me = this.profileService.getProfile();
            this.eventSub = this.realtimeClient.getEventChannel().subscribe(this.eventObserver)
      }

      private sync(dialog: Dialog): void {
            const chat = dialog.conversation.chat;
            const partner = dialog.conversation.partner;
            this.onlineRepo.get(partner.username)
                    .subscribe((online) => {
                          dialog.onlineAt = new Date(online.at)
                    });
            if (dialog.ghost) {
                  this.chatRepo.get(chat.identifier)
                          .subscribe((details) => {
                                if (dialog.ghost) {
                                      dialog.preference = details.preference
                                      dialog.conversation = Conversation.fromPartner(this.me, details.partner)
                                      dialog.ghost = false;
                                }
                          })
            }
      }


      ngOnDestroy(): void {
            this.eventSub.unsubscribe();
      }

      list(index?: Conversation): Observable<IDialog[]> {
            return this.chatRepo.list(index?.chat?.identifier).pipe(
                    map((snapshots: ChatSnapshot[]) => {
                          return snapshots.map((snapshot) => {
                                console.log(snapshot)
                                const conversation = snapshot.conversation;
                                const dialog = this.getOrCreate(conversation) as Dialog;

                                const messageIdx = snapshot.eventList.findIndex((event) => event.message);
                                if (messageIdx >= 0) {
                                      dialog.newestFrom = snapshot.eventList[messageIdx].sender;
                                      dialog.newest = this.announcementService.transform(snapshot.eventList[messageIdx]);
                                      const seenIdx = snapshot.eventList.findIndex((event) => !!event.seenEvent && event.sender !== dialog.newestFrom);
                                      dialog.seen = seenIdx >= 0 && seenIdx < messageIdx;
                                }

                                return dialog;
                          })
                    })
            );
      }

      private getOrCreate(conversation: Conversation): Dialog {
            const identifier = toIdString(conversation.chat.identifier);
            let dialog = this.dialogMap.get(identifier);
            if (!dialog) {
                  dialog = new Dialog(conversation);
                  this.dialogMap.set(identifier, dialog);
            }
            return dialog;
      }

      findByIdentifier(identifier: ChatIdentifier): Observable<IDialog> {
            const dialog = this.dialogMap.get(toIdString(identifier))
            if (dialog) {
                  return of(dialog)
            }
            return this.chatRepo.get(identifier).pipe(map((details) => {
                  const preference = details.preference
                  const conversation = Conversation.fromPartner(this.me, details.partner)
                  const dialog = this.getOrCreate(conversation)
                  if (dialog.ghost) {
                        dialog.preference = preference
                        dialog.conversation = conversation
                        dialog.ghost = false;
                  }
                  return dialog
            }));
      }

      findByIdentifierAndSync(identifier: ChatIdentifier): Observable<IDialog> {
            return this.findByIdentifier(identifier).pipe(tap((dialog) => this.sync(dialog)))
      }

      find(conversation: Conversation): IDialog {
            const online = this.onlineRepo.find(conversation.partner.username);
            const dialog = this.getOrCreate(conversation);
            if (online)
                  dialog.onlineAt = new Date(online.at);
            return dialog;
      }

      findAndSync(conversation: Conversation): IDialog {
            const dialog = this.getOrCreate(conversation);
            this.sync(dialog)
            return dialog;
      }

}

class Dialog implements IDialog {

      constructor(
              public conversation: Conversation,
              public newestFrom: string | undefined = undefined,
              public newest: string | undefined = undefined,
              public preference: Preference | undefined = undefined,
              public onlineAt: Date = new Date(0),
              public seen: boolean = false,
              public ghost: boolean = true
      ) {
      }

}
