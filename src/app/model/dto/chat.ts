import {Preference} from "./preference";

export interface Chat {

      readonly identifier: string,
      readonly preference: Preference,
      readonly roomName: string,
      readonly roomAvatar: string,
      readonly lastActivity: string
}