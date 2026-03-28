import {DestroyRef, inject, Injectable, OnDestroy} from "@angular/core";
import {BehaviorSubject, filter, Observable, Subject, Subscription, timer} from "rxjs";
import {PresenceRepository} from "./presence-repository.service";
import {Preference} from "../../model/dto/preference";
import {LogTrailerService} from "../websocket/log-trailer.service";
import {IDialog} from "./IDialog";
import {TypeMessage} from "../../model/dto/type-message";
import {ChatRepository} from "./chat-repository";
import {InboxLog} from "../../model/dto/inbox-log";
import {LogStream} from "./log-stream.service";
import {Chat} from "../../model/dto/chat";
import {PreferenceMessage} from "../../model/dto/preference-message";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Injectable()
export class DialogService implements OnDestroy {

      private knownDialog = new Map<string, BehaviorSubject<Dialog>>();

      private logObserver = (log: InboxLog) => {
            const dialog = this.find(log.chatId).value
            dialog._roomAvatar.next(log.roomAvatar);
            dialog._roomName.next(log.roomName)
      }

      private destroyRef = inject(DestroyRef);

      constructor(
              private realtimeClient: LogTrailerService,
              private presenceRepo: PresenceRepository,
              private chatRepository: ChatRepository,
              private logStream: LogStream,
      ) {
            this.logStream.getChannel()
                    .pipe(takeUntilDestroyed(this.destroyRef))
                    .subscribe(this.logObserver);
      }

      ngOnDestroy(): void {
      }

      private find(chatId: string): BehaviorSubject<Dialog> {
            const dialogSubject = this.knownDialog.get(chatId)
                    ?? new BehaviorSubject(new Dialog(
                            this.realtimeClient,
                            this.chatRepository,
                            this.presenceRepo,
                            chatId));
            this.knownDialog.set(chatId, dialogSubject);
            return dialogSubject;
      }

      findByChatId(chatId: string): Observable<IDialog> {
            if (!chatId)
                  return new Observable<IDialog>();
            return this.find(chatId).asObservable();
      }

}

class Dialog implements IDialog {

      private roomSub?: Subscription;
      private chatSub?: Subscription;
      private activityTimer?: Subscription

      constructor(
              private readonly realtimeClient: LogTrailerService,
              private readonly chatRepository: ChatRepository,
              private readonly presenceRepo: PresenceRepository,
              readonly identifier: string,
              readonly _preference: Subject<Preference | undefined> = new BehaviorSubject<Preference | undefined>(undefined),
              readonly _presence: Subject<Date | undefined> = new BehaviorSubject<Date | undefined>(undefined),
              readonly _lastActivity: Subject<Date | undefined> = new BehaviorSubject<Date | undefined>(undefined),
              readonly _typings: BehaviorSubject<TypeMessage[]> = new BehaviorSubject<TypeMessage[]>([]),
              readonly _roomName: Subject<string | undefined> = new BehaviorSubject<string | undefined>(undefined),
              readonly _roomAvatar: Subject<string | undefined> = new BehaviorSubject<string | undefined>(undefined),
      ) {
      }

      get roomName(): Observable<string | undefined> {
            return this._roomName
      }

      get roomAvatar(): Observable<string | undefined> {
            return this._roomAvatar
      }

      get presence(): Observable<Date | undefined> {
            return this._presence.asObservable();
      }

      get preference(): Observable<Preference> {
            return this._preference
                    .pipe(filter((value) => value !== undefined));
      }

      get lastActivity(): Observable<Date> {
            return this._lastActivity
                    .pipe(filter((value) => value !== undefined));
      }

      get typings(): Observable<TypeMessage[]> {
            return this._typings.asObservable();
      }

      refresh(): void {
            const threeSecondsAgo = Date.now() - 3000;
            const typings = this._typings.value;
            let changed = false;
            while (typings.length != 0) {
                  const first = typings[0];
                  if (new Date(first.time).getTime() > threeSecondsAgo) {
                        break
                  }
                  typings.shift();
                  changed = true;
            }
            if (changed)
                  this._typings.next(typings);
      }

      fetchSync() {
            this.chatRepository.get(this.identifier).subscribe((chat: Chat) => {
                  this._preference.next(chat.preference);
                  this._lastActivity.next(new Date(chat.lastActivity));
            });

            this.presenceRepo.find([this.identifier])
                    .subscribe((presenceMap) => {
                          const presence = presenceMap[this.identifier];
                          if (presence) {
                                this._presence.next(new Date(presence.at));
                          }
                    })
      }

      onTyping(typing: TypeMessage) {
            const typings = this._typings.value;
            const idx = typings.findIndex((t) => t.from === typing.from)
            if (idx >= 0) {
                  typings[idx] = typing;
            } else {
                  typings.push(typing)
            }
            this._typings.next(typings);
      }

      subscribeChat() {
            this.roomSub = this.realtimeClient.subscribeRoom(this.identifier)
                    .subscribe((message) => {
                          if ("from" in message) {
                                this.onTyping(message as TypeMessage);

                          } else if ("iconId" in message) {
                                this._preference.next(message as PreferenceMessage);
                          }
                          console.debug("Received typing: ", message, "")
                    })
            this.activityTimer = timer(0, 1000).subscribe(() => {
                  this.refresh()
            })
      }

      join(): void {
            this.fetchSync();
            this.subscribeChat();
      }

      leave(): void {
            this.roomSub?.unsubscribe();
            this.chatSub?.unsubscribe();
            this.activityTimer?.unsubscribe();
            this._typings.next([]);
      }

      ping(): void {
            this.realtimeClient.send(this.identifier)
      }

}

