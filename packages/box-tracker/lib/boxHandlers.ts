import { ErgoBox, Token } from './config';

/**
 * Creates a tracker function to check if a given ErgoBox
 * matches the specified address and contains the required tokens.
 *
 * @param {string} address - The ErgoTree (address) to match against the ErgoBox.
 * @param {Token[]} tokens - A list of tokens to verify within the ErgoBox.
 * @returns {boolean} - checks if the ErgoBox matches criteria.
 */
export function generateTracker(address: string, tokens: Token[]) {
  return (box: ErgoBox): boolean => {
    const isAddressMatch = box.ergoTree === address;

    const hasAllTokens = tokens.every((t) => {
      const asset = box.assets.find((a) => a.tokenId === t.tokenId);
      return asset !== undefined && asset.amount >= t.amount;
    });

    return isAddressMatch && hasAllTokens;
  };
}

/**
 * Finds the first ErgoBox from a list of boxes that is not marked as spent.
 *
 * @param {ErgoBox[]} boxes - List of ErgoBoxes to search through.
 * @param {string[]} spentBoxIds - IDs of boxes that have already been spent.
 * @returns {ErgoBox | undefined} - The first unspent ErgoBox, or undefined if none found.
 */
export function reduceTrack(
  boxes: ErgoBox[],
  spentBoxIds: string[],
): ErgoBox | undefined {
  return boxes.find((box) => !spentBoxIds.includes(box.boxId));
}
