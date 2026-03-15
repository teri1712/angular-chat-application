import {MessageState} from "./message-state";

export interface PreferenceState extends MessageState {
      readonly iconId: number,
      readonly roomName: string,
      readonly roomAvatar: string,
      readonly theme: string,

}
