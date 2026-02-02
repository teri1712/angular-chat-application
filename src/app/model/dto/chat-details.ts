import {Preference} from "./preference";
import {Chat} from "./chat";
import {User} from "./user";

export interface ChatDetails {
      chat: Chat,
      partner: User,
      preference: Preference
}