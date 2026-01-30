import {ChatEvent} from '../model/dto/chat-event';
import {HttpClient} from '@angular/common/http';

export interface EventHandlerStrategy {
      create(): ChatEvent;

      send(
              http: HttpClient,
              onSent: () => void,
              onConnectionLost: () => void
      ): void;

      readonly idempotencyKey: string
}
