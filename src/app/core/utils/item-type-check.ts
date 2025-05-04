import {TypeEvent} from "../../model/type-event";
import {Message, OwnerMessage} from "../../model/message";
import {Dialog} from "../../model/dialog";

export function isTypeOrMessage(message: any): message is Message | TypeEvent {
      return message instanceof Message || message instanceof TypeEvent;

}

export function isMessage(message: any): message is Message {
      return message instanceof Message;
}

export function isTyping(message: any): message is TypeEvent {
      return message instanceof TypeEvent;
}


export function isLoading(message: any): message is Boolean {
      return message instanceof Boolean;
}

export function toMessage(message: any): Message {
      return message as Message;
}

export function toOwnerMessage(message: any): OwnerMessage {
      return message as OwnerMessage;
}

export function toTypeEvent(message: any): TypeEvent {
      return message as TypeEvent;
}

export function toTypeOrMessage(message: any): Message | TypeEvent {
      return message as (Message | TypeEvent);
}

export function isDialog(dialog: any): dialog is Dialog {
      return dialog instanceof Dialog;
}
