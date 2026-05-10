import {Preference} from "../../model/dto/preference";
import {TypeMessage} from "../../model/dto/type-message";
import {Observable} from "rxjs";
import {Signal} from "@angular/core";

export interface IDialog {

    readonly identifier: string;
    readonly preference: Observable<Preference>,
    readonly presence: Observable<Date>,
    readonly roomName: Signal<string>,
    readonly roomAvatar: Signal<string>,
    readonly typings: Observable<TypeMessage[]>

    join(): void

    ping(): void,

    leave(): void
}