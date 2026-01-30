import {Conversation} from "./dto/conversation";
import {Preference} from "./dto/preference";

export interface IDialog {
      readonly conversation: Conversation;
      readonly preference: Preference | undefined;
      readonly onlineAt: Date;
      readonly seen: boolean;
      readonly newest: string | undefined;
      readonly newestFrom: string | undefined;
      readonly ghost: boolean
}
