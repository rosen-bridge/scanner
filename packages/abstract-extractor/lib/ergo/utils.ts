import { intersection } from 'lodash-es';
import { OutputBox } from './interfaces';
import { RETRIAL_COUNT } from '../constants';
import { DummyLogger } from '@rosen-bridge/abstract-logger';

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

/**
 * Create delay in procedures based on the specified time in milliseconds
 * @param time
 */
export const delay = async (time: number) =>
  new Promise((resolve) => setTimeout(resolve, time));

/**
 * Retry the request in case of failure
 * Throw error if request fails after RETRIAL_COUNT retrials
 * Wait for 1 second between each trial
 * @param request
 * @param logger
 * @returns
 */
export const requestWithRetrial = async <returnT>(
  request: () => Promise<returnT>,
  logger = new DummyLogger()
): Promise<returnT> => {
  let trial = 0;
  while (true) {
    try {
      const result = await request();
      return result;
    } catch (e) {
      if (trial >= RETRIAL_COUNT)
        throw new Error(
          `request failed after ${trial} retrials with error: ${e}`
        );
      trial++;
      logger.warn(`request failed with error ${e}`);
      logger.debug(`Retrying the request with retrial step ${trial}`);
      await delay(1000);
    }
  }
};
