import {MessageState} from "./message-state";

export interface FileState extends MessageState {
      readonly filename: string,
      readonly uri: string,
      readonly size: number,
}