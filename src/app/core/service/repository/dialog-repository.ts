import {Injectable, OnDestroy} from "@angular/core";
import {GetRepository, Repository} from "./repository";
import {Dialog, PersistenceDialog} from "../../../model/dialog";
import {ChatRepository} from "./chat-repository";
import {EventCache} from "../cache/domain/event-cache";
import {ChannelSubscriber} from "../event/subscribable-channel";
import {ChatEvent} from "../../../model/chat-event";
import {Conversation} from "../../../model/conversation";
import {map, Observable} from "rxjs";
import {ChatSnapshot} from "../../../model/chat-snapshot";
import {OnlineRepository} from "./online-repository";
import {ChatIdentifier} from "../../../model/chat-identifier";
import {AccountManager} from "../auth/account-manager";

@Injectable()
export class DialogRepository implements Repository<Conversation, Dialog>,
        GetRepository<ChatIdentifier, Dialog>, OnDestroy {

      private dialogMap = new Map<string, Dialog>();
      private sub: ChannelSubscriber<ChatEvent> = (event) => {
            const conversation = event.conversation;
            const dialog = this.get(conversation);

            if (event.isMessage()) {
                  dialog.newest = conversation.toMessage(event);
            } else if (
                    !!dialog.newest &&
                    dialog.newest.sender !== event.sender
            ) {
                  dialog.newest.seenAt = event.seenEvent!.at;
            }
      }


      constructor(
              private chatRepo: ChatRepository,
              private onlineRepo: OnlineRepository,
              private eventCache: EventCache,
              private accountManager: AccountManager
      ) {
            this.accountManager.eventChannel.subscribe(this.sub)
      }

      private checkOnline(dialog: Dialog): void {
            const username = dialog.conversation.partner.username
            this.onlineRepo.get(username).subscribe((online) => {
                  dialog.onlineAt = online.at
            });
      }

      ngOnDestroy(): void {
            this.accountManager.eventChannel.unsubscribe(this.sub)

      }

      list(index?: Conversation): Observable<Dialog[]> {
            return this.chatRepo.list(index?.identifier).pipe(
                    map((snapshots: ChatSnapshot[]) => {
                          return snapshots.map((snapshot) => {
                                const conversation = snapshot.conversation;
                                const dialog = this.get(conversation);
                                this.eventCache.save(conversation, snapshot.eventList);
                                dialog.newest = conversation
                                        .toMessages(this.eventCache.get(conversation))[0];
                                return dialog;
                          })
                    })
            );
      }

      get(conversation: Conversation | ChatIdentifier): Dialog {
            if (conversation instanceof Conversation) {
                  const id = conversation.identifier.toString();
                  let dialog = this.dialogMap.get(id);
                  if (!dialog) {
                        dialog = new PersistenceDialog(this.eventCache, conversation);
                        this.dialogMap.set(id, dialog);
                  }
                  this.checkOnline(dialog)
                  return dialog;
            }
            const id = conversation.toString();
            const dialog = this.dialogMap.get(id)
            if (!dialog) {
                  throw new Error("Unable to find dialog");
            }
            return dialog;
      }


}