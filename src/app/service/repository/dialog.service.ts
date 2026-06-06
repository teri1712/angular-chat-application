import {effect, inject, Injectable, signal} from "@angular/core";
import {BehaviorSubject, filter, Observable, Subscription, timer} from "rxjs";
import {PresenceRepository} from "./presence-repository.service";
import {Preference} from "../../model/dto/preference";
import {IDialog} from "./IDialog";
import {TypeMessage} from "../../model/dto/type-message";
import {ChatRepository} from "./chat-repository";
import {InboxLog} from "../../model/dto/inbox-log";
import {LogStream} from "./log-stream.service";
import {Chat} from "../../model/dto/chat";
import {PreferenceMessage} from "../../model/dto/preference-message";
import {LIVE_CHAT_SERVICE, LiveChatService} from "./live-chat.service";

@Injectable()
export class DialogService {

    private knownDialog = new Map<string, BehaviorSubject<Dialog>>();

    private updateDialog(log: InboxLog) {
        const dialog = this.find(log.chatId).value
        dialog._roomAvatar.set(log.roomAvatar);
        dialog._roomName.set(log.roomName)
    }

    private liveChatService = inject(LIVE_CHAT_SERVICE);
    private presenceRepo = inject(PresenceRepository);
    private chatRepository = inject(ChatRepository);
    private logStream = inject(LogStream);

    constructor() {
        effect((onCleanup) => {
            const sub = this.logStream.getChannel()
                .subscribe({
                    next: log => {
                        this.updateDialog(log)
                    }
                })
            onCleanup(() => sub.unsubscribe())
        });
    }

    private find(chatId: string): BehaviorSubject<Dialog> {
        const dialogSubject = this.knownDialog.get(chatId)
            ?? new BehaviorSubject(new Dialog(
                this.liveChatService,
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

    private syncSub?: Subscription;
    private countTenant = 0;

    readonly _preference = new BehaviorSubject<Preference | undefined>(undefined)
    readonly _presence = new BehaviorSubject<Date | undefined>(undefined)
    readonly _typings = new BehaviorSubject<TypeMessage[]>([])
    readonly _roomName = signal<string>('')
    readonly _roomAvatar = signal<string>('')

    readonly roomName = this._roomName.asReadonly()
    readonly roomAvatar = this._roomAvatar.asReadonly()

    constructor(
        private readonly liveChatService: LiveChatService,
        private readonly chatRepository: ChatRepository,
        private readonly presenceRepo: PresenceRepository,
        readonly identifier: string,
    ) {
    }

    get presence(): Observable<Date> {
        return this._presence
            .pipe(filter((value) => value !== undefined));
    }

    get preference(): Observable<Preference> {
        return this._preference
            .pipe(filter((value) => value !== undefined));
    }

    get typings(): Observable<TypeMessage[]> {
        return this._typings.asObservable();
    }

    evictTyping(): void {
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

    onTyping(typing: TypeMessage) {
        const typings = this._typings.value;
        const idx = typings.findIndex((t) =>
            t.from === typing.from)
        if (idx >= 0) {
            typings[idx] = typing;
        } else {
            typings.push(typing)
        }
        this._typings.next(typings);
    }

    pollPresence() {
        this.presenceRepo.find([this.identifier])
            .subscribe({
                next: (presenceMap) => {
                    const presence = presenceMap[this.identifier];
                    if (presence) {
                        this._presence.next(new Date(presence.at));
                    }
                },
                error: err => {
                    console.error(err)
                }
            })
    }

    pollSetting() {
        this.chatRepository.get(this.identifier).subscribe({
            next: (chat: Chat) => {
                this._preference.next(chat.preference);
                this._roomName.set(chat.roomName);
                this._roomAvatar.set(chat.roomAvatar);
            },
            error: (err) => {
                console.error(err)
            }
        });
    }


    performSync() {

        this.pollSetting()
        this.pollPresence()

        this.syncSub = new Subscription()
        const roomSub = this.liveChatService.subscribeRoom(this.identifier)
            .subscribe({
                next: (message) => {
                    this.onTyping(message as TypeMessage);
                },
                error: err => {
                    console.error(err)
                }
            })
        const settingSub = this.liveChatService.subscribeSettings(this.identifier)
            .subscribe({
                next: (message) => {
                    this._preference.next(message as PreferenceMessage);
                },
                error: err => {
                    console.error(err)
                }
            })
        const activityTimer = timer(0, 1000)
            .subscribe({
                next: (sec) => {
                    this.evictTyping()
                    const one_minute_hit = sec % 60 == 0;
                    if (one_minute_hit) this.pollPresence()
                }
            })
        this.syncSub.add(roomSub)
        this.syncSub.add(settingSub)
        this.syncSub.add(activityTimer)
    }

    join(): void {
        if (!this.countTenant++)
            this.performSync();
    }

    leave(): void {
        if (--this.countTenant == 0) {
            this.syncSub?.unsubscribe();
            this.syncSub = undefined;
            this._typings.next([]);
        }
    }

    ping(): void {
        this.liveChatService.typeToRoom(this.identifier)
    }

}
