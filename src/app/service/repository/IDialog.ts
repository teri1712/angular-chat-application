import {Preference} from "../../model/dto/preference";
import {TypeMessage} from "../../model/dto/type-message";
import {Observable} from "rxjs";

export interface IDialog {

      readonly identifier: string;
      readonly preference: Observable<Preference>,
      readonly roomName: Observable<string | undefined>,
      readonly roomAvatar: Observable<string | undefined>,
      readonly presence: Observable<Date | undefined>,
      readonly lastActivity: Observable<Date>,
      readonly typings: Observable<TypeMessage[]>

      join(): void

      ping(): void,

      leave(): void
}