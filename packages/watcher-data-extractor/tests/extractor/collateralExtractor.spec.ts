import { DataSource } from '@rosen-bridge/extended-typeorm';
import { ErgoNetworkType } from '@rosen-bridge/scanner-interfaces';

import { CollateralExtractor } from '../../lib';
import {
  extractedCollateral,
  collateralBox,
} from './collateralExtarctorTestData';
import { createDatabase } from './utilsFunctions.mock';

let dataSource: DataSource;
let extractor: CollateralExtractor;

describe('CollateralExtractor', () => {
  beforeEach(async () => {
    dataSource = await createDatabase();
    extractor = new CollateralExtractor(
      dataSource,
      'extractor1',
      'https://explorer.ergoplatform.com/',
      ErgoNetworkType.Explorer,
      'ChTbcUHgBNqNMVjzUp9HtAxHMFLTWkVzMDWgkptiyNxaQXzwfEjEoUjXkcL81JRowPLk6j7UFSdUWYqbnTXJUzT9tJmiESe4y4e4QqHwMesAzFMmT13oyrLA5QZa8c6ySKeyVQnVnDKDJp92qhSNWrDmeD6n9ca2JSrWFpdYhyzfiPh3zvJk58Mo61YNKiKoF5XPRfNabzZgsm8fU3sBg7ehYrGA4p385HQza768HbzFNTfuUVa8nuuEVKzWbNPfJPPyGaHy3fCqQRaUyRGQbjg7rk1c3eb1Fv3QY4BEJBEmBcGRTfLTbatnV36gmFGJagbjYfRpYvHoZqkEzgpF8JBtcE9Jx4DwnxD75smUqANfMwYctUakhgNdMBv6gJgL7SuKnWYgYE9ohptFf258UjLVfi5yN7nRhpSt3FXdrnXbAZkL485ATxViMeC4Mz4MjMTftuPFFE9fByY1VAPM6jLtevn8J6hGJWft9gMeBfaXAjs5iiVWQyRBDbdtpSAyu4vUPpEfekextUSwnb35dVr99ayKDpBPuViUfHsqxYMAxDhQAVFatHcjRW4dPT7oCLg5He9T2YTA56zx',
      'fb2a47295e30289f3748eb35a325c11db5202b7420ee9588c67f7486de2662db',
    );
  });

  describe('extractBoxData', () => {
    /**
     * @target extractBoxData should extract data in correct format
     * @dependencies
     * @scenario
     * - run test for a box (call `extractBoxData`)
     * @expected
     * - extract the box information
     */
    it('should extract data in correct format', () => {
      const data = extractor.extractBoxData(collateralBox);
      expect(data).toEqual(extractedCollateral);
    });
  });

  describe('hasBoxData', () => {
    /**
     * @target hasBoxData should return true when the box has required ergoTree and token
     * @dependencies
     * @scenario
     * - mock extractor with required address and token
     * - run test (call `hasBoxData`)
     * @expected
     * - to return true
     */
    it('should return true when the box has required ergoTree and token', () => {
      const data = extractor.hasBoxData(collateralBox);
      expect(data).toEqual(true);
    });

    /**
     * @target hasBoxData should return false when the box ergoTree is different
     * @dependencies
     * @scenario
     * - mock extractor with required address and token
     * - run test with different ergoTree (call `hasBoxData`)
     * @expected
     * - to return false
     */
    it('should return false when box ergoTree is different', () => {
      const boxWithDifferentErgoTree = {
        ...collateralBox,
        ergoTree:
          '1005040004000e36100204a00b08cd0279be667ef9dcbbac55a062988a69108cd60e0a9fbb2e0fcc898ce68a7051b66',
      };
      const data = extractor.hasBoxData(boxWithDifferentErgoTree);
      expect(data).toEqual(false);
    });

    /**
     * @target hasBoxData should return false when box doesn't have required token
     * @dependencies
     * @scenario
     * - mock extractor with required address and token
     * - run test with box without token (call `hasBoxData`)
     * @expected
     * - to return false
     */
    it("should return false when box doesn't have required token", () => {
      const boxWithoutToken = {
        ...collateralBox,
        assets: [],
      };
      const data = extractor.hasBoxData(boxWithoutToken);
      expect(data).toEqual(false);
    });

    /**
     * @target hasBoxData should return false when box has different token
     * @dependencies
     * @scenario
     * - mock extractor with required address and token
     * - run test with box with different token (call `hasBoxData`)
     * @expected
     * - to return false
     */
    it('should return false when box has different token', () => {
      const boxWithDifferentToken = {
        ...collateralBox,
        assets: [
          {
            tokenId:
              'dd1d06937ec75aae076f91cacb2fb721d2495030ff2c8096a61bd2b608bdc311',
            amount: BigInt(100),
          },
        ],
      };
      const data = extractor.hasBoxData(boxWithDifferentToken);
      expect(data).toEqual(false);
    });

    /**
     * @target hasBoxData should return false when R4 register is missing
     * @dependencies
     * @scenario
     * - mock extractor with required address and token
     * - run test with box without R4 register (call `hasBoxData`)
     * @expected
     * - to return false
     */
    it('should return false when R4 register is missing', () => {
      const boxWithoutR4 = {
        ...collateralBox,
        additionalRegisters: {
          R5: collateralBox.additionalRegisters.R5,
        },
      };
      const data = extractor.hasBoxData(boxWithoutR4);
      expect(data).toEqual(false);
    });

    /**
     * @target hasBoxData should return false when R5 register is missing
     * @dependencies
     * @scenario
     * - mock extractor with required address and token
     * - run test with box without R5 register (call `hasBoxData`)
     * @expected
     * - to return false
     */
    it('should return false when R5 register is missing', () => {
      const boxWithoutR5 = {
        ...collateralBox,
        additionalRegisters: {
          R4: collateralBox.additionalRegisters.R4,
        },
      };
      const data = extractor.hasBoxData(boxWithoutR5);
      expect(data).toEqual(false);
    });
  });
});
