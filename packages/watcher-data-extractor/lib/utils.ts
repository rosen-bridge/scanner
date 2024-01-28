import { blake2b } from 'blakejs';
import JSONBigInt from 'json-bigint';

const JsonBI = JSONBigInt({
  useNativeBigInt: true,
});

/**
 * calculates hash of WIDs
 * @param WIDs
 * @returns returns WIDsHash with it's count
 */
const getWidInfo = (WIDs: string[]) => {
  const hash = Buffer.from(blake2b(WIDs.join(), undefined, 32)).toString('hex');

  return {
    WIDsHash: hash,
    WIDsCount: WIDs.length,
  };
};

export { JsonBI, getWidInfo };
