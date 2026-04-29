import {Component, DestroyRef, HostListener, inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CdkVirtualScrollViewport} from "@angular/cdk/scrolling";
import {CommonModule} from "@angular/common";
import {ReactiveFormsModule} from "@angular/forms";
import {ActivatedRoute} from "@angular/router";
import {DialogService} from "../../service/repository/dialog.service";
import {BehaviorSubject, combineLatest, filter, map, Observable, pairwise, startWith, switchMap} from "rxjs";
import {MessageListComponent} from "../message-list/message-list.component";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {IDialog} from "../../service/repository/IDialog";
import {Preference} from "../../model/dto/preference";
import {MessageService} from "../../service/message-service";
import {SeenPosting} from "../../service/seen-handler";
import {debounceTime} from "rxjs/operators";

@Component({
    selector: 'app-message-panel',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MessageListComponent,

        // CdkAutoSizeVirtualScroll
    ],
    providers: [
        // {
        //       provide: VIRTUAL_SCROLL_STRATEGY,
        //       useFactory: autoSizeStrategyFactory
        // }
    ],
    templateUrl: './message-panel.component.html',
    styleUrl: './message-panel.component.css'
})
export class MessagePanelComponent implements OnInit, OnDestroy {

    @ViewChild('viewport') viewport!: CdkVirtualScrollViewport;

    protected initialRoomName = new BehaviorSubject<string | null>(null);
    protected initialRoomAvatar = new BehaviorSubject<string | null>(null);
    protected initialPresence = new BehaviorSubject<Date | null>(null);

    protected chatId = new BehaviorSubject<string | null>(null);
    protected roomName = new Observable<string>();
    protected roomAvatar = new Observable<string>();
    protected presence: Observable<Date> = new Observable();
    protected preference: Observable<Preference> = new Observable();


    private destroyRef = inject(DestroyRef);

    constructor(
        private readonly dialogService: DialogService,
        private readonly activatedRoute: ActivatedRoute,
        private readonly messageService: MessageService
    ) {
    }

    ngOnInit(): void {
        const dialog = this.chatId.pipe(
            filter(chatId => chatId != null),
            switchMap(chatId =>
                this.dialogService.findByChatId(chatId))
        );
        this.roomName = combineLatest(
            [this.initialRoomName,
                dialog.pipe(switchMap((dialog) => dialog.roomName), startWith(undefined))])
            .pipe(map(([initialOne, newOne]) => {
                return newOne ?? initialOne ?? '';
            }));
        this.roomAvatar = combineLatest(
            [this.initialRoomAvatar,
                dialog.pipe(switchMap((dialog) => dialog.roomAvatar), startWith(undefined))])

            .pipe(map(([initialOne, newOne]) => {
                return newOne ?? initialOne ?? '';
            }));
        this.presence = combineLatest(
            [this.initialPresence,
                dialog.pipe(switchMap((dialog) => dialog.presence))])
            .pipe(map(([initialOne, newOne]) => {
                return newOne ?? initialOne ?? new Date(0);
            }));
        this.preference = dialog.pipe(switchMap((dialog) => dialog.preference),);

        dialog.pipe(
            startWith(null),
            pairwise(),
            takeUntilDestroyed(this.destroyRef))
            .subscribe(([prev, curr]) => {
                if (prev) {
                    prev.leave()
                }
                if (curr) {
                    this.curr = curr;
                    curr.join();
                }
            })
        combineLatest([
            this.seen,
            this.chatId.pipe(filter(chatId => chatId != null))
        ])
            .pipe(takeUntilDestroyed(this.destroyRef),
                debounceTime(500)
            )
            .subscribe(([at, chatId]) => {
                this.seenCheck(at, chatId);
            })

        this.observeRoutes()
    }

    observeRoutes() {
        combineLatest([
            this.activatedRoute.paramMap,
            this.activatedRoute.queryParamMap
        ])
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(([params, query]) => {
                const id = params.get('id')!;
                const roomName = query.get('roomName');
                const roomAvatar = query.get('roomAvatar');
                const presence = query.get('presence');
                this.refresh(id, roomName, roomAvatar, presence);
            })
    }

    private curr?: IDialog

    ngOnDestroy(): void {
        this.curr?.leave()
        this.curr = undefined;
    }

    private refresh(chatId: string, roomName: string | null, roomAvatar: string | null, presence: string | null) {
        if (roomName)
            this.initialRoomName.next(roomName);
        if (roomAvatar)
            this.initialRoomAvatar.next(roomAvatar);
        if (presence)
            this.initialPresence.next(new Date(presence));
        this.chatId.next(chatId);
    }


    private seen = new BehaviorSubject<Date>(new Date())

    @HostListener('focusin')
    onFocus() {
        // this.seen.next(new Date());
    }


    seenCheck(at: Date, chatId: string) {
        const seenPosting = new SeenPosting(at, chatId);
        this.messageService.send(seenPosting);
    }
}


