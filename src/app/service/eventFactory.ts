import {MessageState} from '../model/dto/message-state';
import {Conversation} from "../model/dto/conversation";

export interface EventFactory {

      create(conversation: Conversation, payload: any): MessageState;

}
