import Expander from "../expander/expander";
import {EventRepository} from "../../service/repository/event-repository";
import {map, Observable} from "rxjs";
import {ChatEvent} from "../../model/dto/chat-event";
import {IDialog} from "../../model/IDialog";

export default class EventExpander implements Expander<ChatEvent> {

      private tailEvent?: ChatEvent
      private end = false

      constructor(private readonly dialog: IDialog, private readonly eventRepository: EventRepository) {

      }

      isEnd(): boolean {
            return this.end
      }

      expand(): Observable<ChatEvent[]> {
            const startAt = this.tailEvent;
            const atVersion = startAt?.eventVersion;
            return (this.eventRepository.list({
                  conversation: this.dialog.conversation,
                  atVersion: atVersion
            }) as Observable<ChatEvent[]>).pipe(map((events: ChatEvent[]) => {
                  if (startAt) {
                        events.shift();
                  }

                  const length = events.length;
                  if (length === 0)
                        this.end = true;
                  else
                        this.tailEvent = events[length - 1];
                  return events;
            }))
      }
}