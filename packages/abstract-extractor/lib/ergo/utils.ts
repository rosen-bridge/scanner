import { intersection } from 'lodash-es';
import { OutputBox } from './interfaces';

/**
 * Check box to have specified tokens
 * @param box
 * @return true if box has the required token and false otherwise
 */
export const boxHasToken = (box: OutputBox, tokenIds: string[]) => {
  if (!box.assets) return false;
  const boxTokens = box.assets.map((token) => token.tokenId);
  const requiredTokens = intersection(tokenIds, boxTokens);
  if (requiredTokens.length == tokenIds.length) return true;
  return false;
};
