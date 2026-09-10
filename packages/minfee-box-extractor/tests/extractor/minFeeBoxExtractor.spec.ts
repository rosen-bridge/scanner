import { describe, it, expect, vi, beforeEach } from 'vitest';

import { DataSource } from '@rosen-bridge/extended-typeorm';
import { ErgoNetworkType, OutputBox } from '@rosen-bridge/scanner-interfaces';

import { MinFeeBoxExtractor } from '../../lib';
import { createDatabase } from '../mocked/utils.mock';
import {
  BOX_WITHOUT_ASSETS,
  BOX_WITHOUT_SECOND_TOKEN,
  BOX_WITH_SECOND_TOKEN,
  BOX_WITH_WRONG_ADDRESS,
  BOX_WITH_WRONG_NFT,
  NFT,
  TRACKED_ADDRESS,
} from './testData';

vi.mock('ergo-lib-wasm-nodejs', () => {
  return {
    Address: {
      from_base58: (addr: string) => ({
        to_ergo_tree: () => ({ to_base16_bytes: () => `${addr}-tree` }),
      }),
    },
    ErgoBox: {
      from_json: (json: string) => {
        const boxId = /"boxId":"([^"]+)"/.exec(json)?.[1];
        return {
          box_id: () => ({ to_str: () => boxId }),
          sigma_serialize_bytes: () => Buffer.from(boxId ?? ''),
        };
      },
    },
  };
});

describe('MinFeeBoxExtractor', () => {
  let dataSource: DataSource;
  let extractor: MinFeeBoxExtractor;

  beforeEach(async () => {
    dataSource = await createDatabase();
    extractor = new MinFeeBoxExtractor(
      dataSource,
      'https://explorer.ergoplatform.com/',
      ErgoNetworkType.Explorer,
      TRACKED_ADDRESS,
      NFT,
      undefined,
      false,
    );
  });

  describe('hasBoxData', () => {
    /**
     * @target hasBoxData should return true when the box is sent to the
     * tracked address and its first token is the required NFT
     * @dependencies
     * @scenario
     * - run test for a matching box (call `hasBoxData`)
     * @expected
     * - to return true
     */
    it('should return true when box address and first token match', () => {
      const result = extractor.hasBoxData(
        BOX_WITH_SECOND_TOKEN as unknown as OutputBox,
      );
      expect(result).toEqual(true);
    });

    /**
     * @target hasBoxData should return false when the box is sent to a
     * different address
     * @dependencies
     * @scenario
     * - run test for a box with a different ergoTree (call `hasBoxData`)
     * @expected
     * - to return false
     */
    it('should return false when box address is different', () => {
      const result = extractor.hasBoxData(
        BOX_WITH_WRONG_ADDRESS as unknown as OutputBox,
      );
      expect(result).toEqual(false);
    });

    /**
     * @target hasBoxData should return false when the box's first token is
     * not the required NFT
     * @dependencies
     * @scenario
     * - run test for a box whose first asset is not the NFT (call `hasBoxData`)
     * @expected
     * - to return false
     */
    it("should return false when the box's first token is not the NFT", () => {
      const result = extractor.hasBoxData(
        BOX_WITH_WRONG_NFT as unknown as OutputBox,
      );
      expect(result).toEqual(false);
    });

    /**
     * @target hasBoxData should return false when the box has no assets
     * @dependencies
     * @scenario
     * - run test for a box with an empty assets array (call `hasBoxData`)
     * @expected
     * - to return false
     */
    it('should return false when the box has no assets', () => {
      const result = extractor.hasBoxData(
        BOX_WITHOUT_ASSETS as unknown as OutputBox,
      );
      expect(result).toEqual(false);
    });
  });

  describe('extractBoxData', () => {
    /**
     * @target extractBoxData should include the box's second token when
     * present
     * @dependencies
     * @scenario
     * - run test for a box with two assets (call `extractBoxData`)
     * @expected
     * - extracted data contains the second token id
     */
    it('should extract the second token when it exists', () => {
      const data = extractor.extractBoxData(
        BOX_WITH_SECOND_TOKEN as unknown as OutputBox,
      );
      expect(data).toEqual({
        identifier: BOX_WITH_SECOND_TOKEN.boxId,
        serialized: Buffer.from(BOX_WITH_SECOND_TOKEN.boxId).toString('base64'),
        token: 'secondTokenId',
      });
    });

    /**
     * @target extractBoxData should set the second token to null when the
     * box only carries the NFT
     * @dependencies
     * @scenario
     * - run test for a box with a single asset (call `extractBoxData`)
     * @expected
     * - extracted data has a null second token
     */
    it('should set second token to null when it does not exist', () => {
      const data = extractor.extractBoxData(
        BOX_WITHOUT_SECOND_TOKEN as unknown as OutputBox,
      );
      expect(data).toEqual({
        identifier: BOX_WITHOUT_SECOND_TOKEN.boxId,
        serialized: Buffer.from(BOX_WITHOUT_SECOND_TOKEN.boxId).toString(
          'base64',
        ),
        token: null,
      });
    });
  });
});
