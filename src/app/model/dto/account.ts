import {AccessToken} from "./access-token";
import {Profile} from "./profile";

export interface Account {
      readonly profile: Profile,
      readonly accessToken: AccessToken,
}