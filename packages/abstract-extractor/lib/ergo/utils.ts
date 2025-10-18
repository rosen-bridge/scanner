import { intersection } from 'lodash-es';

import { DummyLogger } from '@rosen-bridge/abstract-logger';
import { OutputBox } from '@rosen-bridge/scanner-interfaces';

import { RETRIAL_COUNT } from '../constants';

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
  logger = new DummyLogger(),
): Promise<returnT> => {
  let trial = 0;
  let lastErrorMessage: string | undefined;
  while (trial < RETRIAL_COUNT) {
    try {
      const result = await request();
      return result;
    } catch (e) {
      lastErrorMessage = e instanceof Error ? e.message : String(e);
      trial++;
      logger.warn(`request failed with error ${lastErrorMessage}`);
      logger.debug(`Retrying the request with retrial step ${trial}`);
      await delay(1000);
    }
  }
  throw new Error(
    `request failed after ${trial} retrials with error: ${lastErrorMessage}`,
  );
};
