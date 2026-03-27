import {MessageState} from "../../../model/dto/message-state";

export class Cache {

      constructor(
              private readonly sequences: number[] = [],
              private readonly messageMap: Map<number, MessageState> = new Map()) {
      }


      private binary_search(sequenceNumber: number): number {
            let left = 0, right = this.sequences.length;
            while (left != right) {
                  const mid = Math.floor((left + right) / 2);
                  const midSeq = this.sequences[mid];
                  if (midSeq < sequenceNumber) {
                        left = mid + 1;
                  } else {
                        right = mid;
                  }
            }
            return left;
      }

      put(message: MessageState): void {
            const sequenceNumber = message.sequenceNumber;
            const index = this.binary_search(sequenceNumber);
            if (index != this.sequences.length && this.sequences[index] == sequenceNumber) {
                  const now = new Date(message.updatedAt).getTime()
                  const old = new Date(this.messageMap.get(sequenceNumber)!.updatedAt).getTime()
                  if (old <= now)
                        this.messageMap.set(sequenceNumber, message);
            } else {
                  this.sequences.splice(index, 0, sequenceNumber);
                  this.messageMap.set(sequenceNumber, message);
            }
      }

      list(sequenceNumber: number): MessageState[] {
            if (this.sequences.length == 0) {
                  return [];
            }
            const index = this.binary_search(sequenceNumber + 1) - 1;
            return this.sequences.slice(Math.max(index - 20, 0), index + 1)
                    .map((seq) => this.messageMap.get(seq)!)
                    .reverse();
      }

      get(sequenceNumber: number): MessageState | undefined {
            return this.messageMap.get(sequenceNumber);
      }
}