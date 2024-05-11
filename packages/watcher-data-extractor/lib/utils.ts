import { blake2b } from 'blakejs';
import JSONBigInt from 'json-bigint';

const JsonBI = JSONBigInt({
  useNativeBigInt: true,
});

/**
 * converts hex string to Uint8Array bytes
 *
 * @param {Uint8Array} bytes
 * @return {string}
 */
export const uint8ArrayToHex = (bytes: Uint8Array): string => {
  return Buffer.from(bytes).toString('hex');
};

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
