import { describe, it, expect, vi, beforeEach } from 'vitest';

import { DataSource } from '@rosen-bridge/extended-typeorm';
import { ErgoNetworkType, OutputBox } from '@rosen-bridge/scanner-interfaces';

import { ERG_TOKEN_ID, MinFeeBoxExtractor } from '../../lib';
import { createDatabase } from '../mocked/utils.mock';
import {
  BOX_WITHOUT_ASSETS,
  BOX_WITHOUT_REGISTERS,
  BOX_WITHOUT_SECOND_TOKEN,
  BOX_WITH_PARTIAL_REGISTERS,
  BOX_WITH_SECOND_TOKEN,
  BOX_WITH_WRONG_ADDRESS,
  BOX_WITH_WRONG_NFT,
  NFT,
  REGISTERS,
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
    it('should return true when the box is sent to the tracked address and its first token is the required NFT', () => {
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
    it('should return false when the box is sent to a different address', () => {
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
    it("should return false when the box's first token is not the required NFT", () => {
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

    /**
     * @target hasBoxData should return false when the box carries none of
     * the additional registers (R4-R9)
     * @dependencies
     * @scenario
     * - run test for a box with empty additional registers (call
     *   `hasBoxData`)
     * @expected
     * - to return false
     */
    it('should return false when the box carries none of the additional registers (R4-R9)', () => {
      const result = extractor.hasBoxData(
        BOX_WITHOUT_REGISTERS as unknown as OutputBox,
      );
      expect(result).toEqual(false);
    });

    /**
     * @target hasBoxData should return false when the box is missing any of
     * the additional registers (R4-R9)
     * @dependencies
     * @scenario
     * - run test for a box missing register R9 (call `hasBoxData`)
     * @expected
     * - to return false
     */
    it('should return false when the box is missing any of the additional registers (R4-R9)', () => {
      const result = extractor.hasBoxData(
        BOX_WITH_PARTIAL_REGISTERS as unknown as OutputBox,
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
    it("should include the box's second token when present", () => {
      const data = extractor.extractBoxData(
        BOX_WITH_SECOND_TOKEN as unknown as OutputBox,
      );
      expect(data).toEqual({
        identifier: BOX_WITH_SECOND_TOKEN.boxId,
        serialized: Buffer.from(BOX_WITH_SECOND_TOKEN.boxId).toString('base64'),
        token: 'secondTokenId',
        ...REGISTERS,
      });
    });

    /**
     * @target extractBoxData should set token to 'erg' when the box has no
     * second asset
     * @dependencies
     * @scenario
     * - run test for a box with a single asset (call `extractBoxData`)
     * @expected
     * - extracted data has token set to 'erg'
     */
    it("should set token to 'erg' when the box has no second asset", () => {
      const data = extractor.extractBoxData(
        BOX_WITHOUT_SECOND_TOKEN as unknown as OutputBox,
      );
      expect(data).toEqual({
        identifier: BOX_WITHOUT_SECOND_TOKEN.boxId,
        serialized: Buffer.from(BOX_WITHOUT_SECOND_TOKEN.boxId).toString(
          'base64',
        ),
        token: ERG_TOKEN_ID,
        ...REGISTERS,
      });
    });

    /**
     * @target extractBoxData should extract the box's additional registers
     * (R4-R9) as raw serialized strings
     * @dependencies
     * @scenario
     * - run test for a box carrying all six additional registers (call
     *   `extractBoxData`)
     * @expected
     * - extracted data contains R4-R9 matching the box's raw register values
     */
    it("should extract the box's additional registers (R4-R9) as raw serialized strings", () => {
      const data = extractor.extractBoxData(
        BOX_WITH_SECOND_TOKEN as unknown as OutputBox,
      );
      expect(data).toMatchObject(REGISTERS);
    });
  });
});
