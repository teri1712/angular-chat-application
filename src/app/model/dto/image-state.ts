import {ImageSpec} from "./image-spec";
import {MessageState} from "./message-state";

export interface ImageState extends MessageState {
      readonly image: ImageSpec,

}