import {Equality} from "../usecases/utils/array";
import {uuidCompare} from "../utils/uuid.utils";

export class ChatIdentifier implements Equality {
      private stringValue?: string;

      static from(raw: any): ChatIdentifier {
            const firstUser = raw.firstUser ?? "";
            const secondUser = raw.secondUser ?? "";
            return new ChatIdentifier(firstUser, secondUser);
      }

      constructor(public firstUser: string = "", public secondUser: string = "") {
            if (uuidCompare(firstUser, secondUser) > 0) {
                  const temp = this.firstUser;
                  this.firstUser = this.secondUser;
                  this.secondUser = temp;
            }
      }

      equals(other: any): boolean {
            return other instanceof ChatIdentifier
                    && this.firstUser === other.firstUser
                    && this.secondUser === other.secondUser;
      }


      toString(): string {
            if (!this.stringValue) {
                  this.stringValue = `${this.firstUser}+${this.secondUser}`
            }
            return this.stringValue!
      }

      static fromString(str: string): ChatIdentifier {
            const parts = str.split(/\+/);
            return new ChatIdentifier(parts[0], parts[1]);
      }
}