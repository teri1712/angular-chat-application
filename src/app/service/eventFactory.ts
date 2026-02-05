import {ChatEvent} from '../model/dto/chat-event';
import {Conversation} from "../model/dto/conversation";

export interface EventFactory {

      create(conversation: Conversation, payload: any): ChatEvent;

}
