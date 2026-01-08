import * as ergoLib from 'ergo-lib-wasm-nodejs';

import { OutputBox } from '@rosen-bridge/scanner-interfaces';

import { Token } from './interfaces';

/**
 * Creates a tracker function to check if a given ErgoBox
 * matches the specified address and contains the required tokens.
 *
 * @param address - The ErgoTree (address) to match against the ErgoBox.
 * @param  tokens - A list of tokens to verify within the ErgoBox.
 * @returns checks if the ErgoBox matches criteria.
 */
export const generateTracker = (address: string, tokens: Token[]) => {
  return (box: OutputBox): boolean => {
    if (
      box.ergoTree !==
      ergoLib.Address.from_base58(address).to_ergo_tree().to_base16_bytes()
    )
      return false;
    const assetMap = new Map(box.assets.map((a) => [a.tokenId, a.amount]));
    return tokens.every((t) => {
      const amount = assetMap.get(t.tokenId);
      return amount !== undefined && amount >= t.amount;
    });
  };
};

/**
 * Finds the first ErgoBox from a list of boxes that is not marked as spent.
 *
 * @param  boxes - List of ErgoBoxes to search through.
 * @param  spentBoxIds - IDs of boxes that have already been spent.
 * @returns The first unspent ErgoBox, or undefined if none found.
 */
export const reduceTrack = (
  boxes: OutputBox[],
  spentBoxIds: string[],
): OutputBox | undefined => {
  return boxes.find((box) => !spentBoxIds.includes(box.boxId));
};
