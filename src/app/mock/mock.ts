import {User} from "../model/user";
import {ImageSpec} from "../model/image-spec";
import {Account} from "../model/account";
import {AccessToken} from "../model/access-token";
import {SyncContext} from "../model/sync-context";
import {Conversation} from "../model/conversation";
import {Chat} from "../model/chat";
import {ChatIdentifier} from "../model/chat-identifier";
import {Message, OwnerMessage, PartnerMessage} from "../model/message";
import {TextEvent} from "../model/text-event";
import {ChatEvent} from "../model/chat-event";
import {ONE_WEEK_MILLIS} from "../core/utils/time";
import {IconEvent} from "../model/icon-event";
import {ImageEvent} from "../model/image-event";
import {Dialog} from "../model/dialog";

export const user = new User(
        "luffy",
        "Luffy",
        "Luffy",
        "MALE",
        new ImageSpec("https://miro.medium.com/v2/resize:fit:736/1*YqfVlyCe06DfcPsR3kpYrw.jpeg", "", 50, 50),
        "ROLE_USER")

export const nami = new User(
        "nami",
        "Nami",
        "Nami",
        "FEMALE",
        new ImageSpec("https://cdn.popsww.com/blog/sites/2/2022/04/nami.jpg", "", 50, 50),
        "ROLE_USER")

export const chopper = new User(
        "chopper",
        "Chopper",
        "Chopper",
        "FEMALE",
        new ImageSpec("https://i.pinimg.com/474x/c0/c7/1b/c0c71bcadc86be5ea1c9193e71e3b05a.jpg", "", 50, 50),
        "ROLE_USER")


export const account = new Account(
        user.id,
        user,
        new SyncContext(0),
        new AccessToken("", "", 0, new Date())
)
export const namiChat = new Chat(new ChatIdentifier("luffy", "nami"), user.id, nami.id)
export const chopperChat = new Chat(new ChatIdentifier("luffy", "chopper"), user.id, chopper.id)
export const namiConversion = new Conversation(namiChat, user, nami)
export const chopperConversion = new Conversation(chopperChat, user, chopper)
export const namiDialog = new (class extends Dialog {
      override get messages(): Message[] {
            return [this.newest!]
      }

      constructor() {
            super(namiConversion, Date.now() / 1000, mockTextMessage(namiConversion));
      }
})
export const chopperDialog = new (class extends Dialog {
      override get messages(): Message[] {
            return [this.newest!]
      }

      constructor() {
            super(chopperConversion, Date.now() / 1000 - 2 * 60, mockTextMessage(chopperConversion));
      }
})

export function mockTextMessage(
        conversation: Conversation,
        mine = false
): Message {
      const textEvent = new TextEvent('Hello');
      const chatEvent = new ChatEvent(
              crypto.randomUUID(),
              conversation.identifier,
              mine ? conversation.owner.id : conversation.partner.id,
              Date.now() - ONE_WEEK_MILLIS + 2 * 60 * 1000,
              textEvent
      )
      return mine
              ? new OwnerMessage(chatEvent)
              : new PartnerMessage(chatEvent);
}

/** Creates a mock “icon sent” message */
export function mockIconMessage(
        conversation: Conversation,
        mine = false
): Message {
      const iconEvent = new IconEvent(1);
      const chatEvent = new ChatEvent(
              crypto.randomUUID(),
              conversation.identifier,
              mine ? conversation.owner.id : conversation.partner.id,
              Date.now() - ONE_WEEK_MILLIS + 2 * 60 * 1000,
              undefined,
              undefined,
              undefined,
              iconEvent
      )
      return mine
              ? new OwnerMessage(chatEvent)
              : new PartnerMessage(chatEvent);
}

export function mockImageMessage(
        conversation: Conversation,
        mine = false
): Message {
      const imageSpec = new ImageSpec(
              'https://i.pinimg.com/736x/92/90/4f/92904fb81b692e508efa3dfe55190829.jpg',
              '',
              500,
              500
      );
      const imageEvent = new ImageEvent(imageSpec)
      const chatEvent = new ChatEvent(
              crypto.randomUUID(),
              conversation.identifier,
              mine ? conversation.owner.id : conversation.partner.id,
              Date.now() - ONE_WEEK_MILLIS + 2 * 60 * 1000,
              undefined,
              undefined,
              imageEvent,
      )
      return mine
              ? new OwnerMessage(chatEvent)
              : new PartnerMessage(chatEvent);
}

