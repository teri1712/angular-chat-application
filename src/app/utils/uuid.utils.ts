/** Compare two UUID strings the same way Java's UUID.compareTo does.
 *  Returns -1, 0, or 1.
 */
export function uuidCompare(uuid1: string, uuid2: string): number {
      if (!uuid1 || !uuid2)
            return 0;

      const parseUuid = (u: string) => {
            const parts = u.split('-');
            if (parts.length !== 5) {
                  throw new Error('Invalid UUID format: ' + u);
            }
            // parts: 8-4-4-4-12 hex chars
            const msb = BigInt('0x' + parts[0] + parts[1] + parts[2]); // 64-bit hex
            const lsb = BigInt('0x' + parts[3] + parts[4]);           // 64-bit hex

            // Convert unsigned BigInt (0..2^64-1) to signed 64-bit BigInt (-2^63..2^63-1)
            const TWO_63 = 1n << 63n;
            const TWO_64 = 1n << 64n;
            const toSigned64 = (n: bigint) => (n >= TWO_63 ? n - TWO_64 : n);

            return {msb: toSigned64(msb), lsb: toSigned64(lsb)};
      };

      const a = parseUuid(uuid1);
      const b = parseUuid(uuid2);

      if (a.msb < b.msb) return -1;
      if (a.msb > b.msb) return 1;
      if (a.lsb < b.lsb) return -1;
      if (a.lsb > b.lsb) return 1;
      return 0;
}
