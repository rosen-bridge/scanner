import JSONBigInt from 'json-bigint';

const JsonBI = JSONBigInt({
  useNativeBigInt: true,
});

export { JsonBI };

/**
 * converts hex string to Uint8Array bytes
 *
 * @param {Uint8Array} bytes
 * @return {string}
 */
export const uint8ArrayToHex = (bytes: Uint8Array): string => {
  return Buffer.from(bytes).toString('hex');
};
