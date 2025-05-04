export interface Equality {
      equals(other: any): boolean;
}

export interface Orderable {
      readonly order: number
}


export function union<T extends Equality>(t: T[], other: T[]): T[] {
      return [...t, ...other.filter(item => !t.find((z) => z.equals(item)))];
}

export function binary_search<T extends Orderable>(array: T[], item: Orderable): number {
      let left = 0, right = array.length;
      while (left != right) {
            const mid = Math.floor((left + right) / 2);
            if (array[mid].order >= item.order) {
                  right = mid;
            } else {
                  left = mid + 1;
            }
      }
      return left
}