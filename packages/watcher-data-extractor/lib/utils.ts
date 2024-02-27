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
const getWidInfo = (WIDs: string) => {
  const WIDsArray = WIDs.split(',');
  const hash = Buffer.from(
    blake2b(Buffer.from(WIDsArray.join(''), 'hex'), undefined, 32)
  ).toString('hex');

  return {
    WIDsHash: hash,
    WIDsCount: WIDsArray.length,
  };
};

export { JsonBI, getWidInfo };
