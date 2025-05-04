import {Message} from "../../model/message";
import {Conversation} from "../../model/conversation";
import {formatRelativeTime} from "./time";

export function announcementOf(conversation: Conversation, newest: Message): string {
      const mine = newest.sender === conversation.owner.id;

      let content: string;
      if (newest.imageEvent) {
            content = 'has sent an image';
      } else if (newest.iconEvent) {
            content = 'has sent an icon';
      } else if (newest.textEvent) {
            content = newest.textEvent.content;
      } else {
            content = '';
      }
      content += ' · ' + formatRelativeTime(newest.receiveTime);
      const sub = mine ? 'You' : conversation.partner.name;

      const sep = newest.textEvent ? ' : ' : ' ';

      return `${sub}${sep}${content}`;
}