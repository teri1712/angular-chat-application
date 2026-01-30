import {uuidCompare} from "../../utils/uuid.utils";

export class ChatIdentifier {

      constructor(public firstUser: string = "", public secondUser: string = "") {
            if (uuidCompare(firstUser, secondUser) > 0) {
                  const temp = this.firstUser;
                  this.firstUser = this.secondUser;
                  this.secondUser = temp;
            }
      }

}

export function toIdString(identifier: ChatIdentifier): string {
      return identifier.firstUser + "+" + identifier.secondUser!
}

export function fromString(str: string): ChatIdentifier {
      const parts = str.split(/\+/);
      return new ChatIdentifier(parts[0], parts[1]);
}