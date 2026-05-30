import {effect, inject, Injectable, signal} from "@angular/core";
import {BehaviorSubject, filter, Observable, Subscription, timer} from "rxjs";
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

@Injectable()
export class DialogService {

    private knownDialog = new Map<string, BehaviorSubject<Dialog>>();

    private updateDialog(log: InboxLog) {
        const dialog = this.find(log.chatId).value
        dialog._roomAvatar.set(log.roomAvatar);
        dialog._roomName.set(log.roomName)
    }

    private realtimeClient = inject(LogTrailerService);
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
    private settingSub?: Subscription;
    private chatSub?: Subscription;
    private activityTimer?: Subscription
    private countTenant = 0;

    readonly _preference = new BehaviorSubject<Preference | undefined>(undefined)
    readonly _presence = new BehaviorSubject<Date | undefined>(undefined)
    readonly _typings = new BehaviorSubject<TypeMessage[]>([])
    readonly _roomName = signal<string>('')
    readonly _roomAvatar = signal<string>('')

    readonly roomName = this._roomName.asReadonly()
    readonly roomAvatar = this._roomAvatar.asReadonly()

    constructor(
        private readonly realtimeClient: LogTrailerService,
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
        const idx = typings.findIndex((t) => t.from === typing.from)
        if (idx >= 0) {
            typings[idx] = typing;
        } else {
            typings.push(typing)
        }
        this._typings.next(typings);
    }

    fetchSync() {
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

    subscribeChat() {
        this.roomSub = this.realtimeClient.subscribeRoom(this.identifier)
            .subscribe({
                next: (message) => {
                    this.onTyping(message as TypeMessage);
                    console.debug("Received typing: ", message, "")
                },
                error: err => {
                    console.error(err)
                }
            })
        this.settingSub = this.realtimeClient.subscribeSettings(this.identifier)
            .subscribe({
                next: (message) => {
                    this._preference.next(message as PreferenceMessage);
                    console.debug("Received preference: ", message, "")
                },
                error: err => {
                    console.error(err)
                }
            })
        this.activityTimer = timer(0, 1000)
            .subscribe(() => {
                this.evictTyping()
            })
    }

    join(): void {
        this.fetchSync();
        if (this.countTenant == 0)
            this.subscribeChat();
        this.countTenant++;
    }

    leave(): void {
        this.countTenant--;
        if (this.countTenant == 0) {
            this.roomSub?.unsubscribe();
            this.settingSub?.unsubscribe();
            this.chatSub?.unsubscribe();
            this.activityTimer?.unsubscribe();
            this._typings.next([]);
        }
    }

    ping(): void {
        this.realtimeClient.send(this.identifier)
    }

}
