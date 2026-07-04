import { DataSource } from '@rosen-bridge/extended-typeorm';
import { ErgoNetworkType } from '@rosen-bridge/scanner-interfaces';

import PermitExtractor from '../../lib/extractor/permitExtractor';
import { extractedPermit, permitBox } from './permitExtractorTestData';
import { permitAddress, RWTId } from './testData';
import { createDatabase } from './testUtils';

vi.mock('@rosen-clients/ergo-explorer');
let dataSource: DataSource;
let extractor: PermitExtractor;

describe('permitExtractor', () => {
  beforeEach(async () => {
    dataSource = await createDatabase();
    extractor = new PermitExtractor(
      'extractorId',
      dataSource,
      permitAddress,
      RWTId,
      {
        active: true,
        type: ErgoNetworkType.Explorer,
        url: 'https://explorer.ergoplatform.com/',
        address:
          '2Eit2LFRqu2Mo33z3pYTJRHNCMq8F5shBvB1xmwtrGiZohpcoacfYASrP6jyWdbE1iBqAxgTmjFCF5UBPXzwbkuoDKq3PSTEDeCkCxP3GmrPARY4RUX9LvKUShwpSnMoPmxqQEQ54XKy63V1qxp4m5vYA2z7zwvFMcq9Thzr61aXKcRtV24pm2xnuuXUz7cJdghdPipxcvrJSMAhGiMtfZhhHUtCR2Ho4W7tUByNyJanXYPxM9uijstv6D3ryvWT1p1MxGyy1Epx7dSMYQgxq8x1HecAuG65VsykmtdzaDuJFBxiC5QBrfh9CiqT1k6UW798wb7Pa4oGopYXTLEuviFifnUSo6DzrTfaDQkdxPENqXDTF63noiPmRsPYB5wxbDXf2DBSB9359MdXbZLFymcPd8ofdZz7k6xQ9w53EfCg8HMkLf8mgR7e6XnhnB4jQ5q4DYbSw4yfg7fmDwDne5RwcUz8urhLFSba9qt4XJvT4oBuMfk1LRaRVyk4K9xecqSGXEMW6p3mQw2YDpZbGo5hLtpTvTPmrxqYkVpbNfgb6kkV1eKyHWo89jCQnG5zzjrENgmDhTYXUnD6P6stzuaJKXhQBWKGnu6pHZhsZ9WgRAQJP7AcRxJ6Qj77iiE4EqnAiVFaUXKJsd5cr1e8euXvBaaDRXcGezbw9psZ3NthzpWjtJTgyS8PLxKHFdTZyKLkKc',
      },
    );
  });

  /**
   * getting id of the extractor tests
   * Dependency: Nothing
   * Scenario: calling getId of CommitmentExtractor
   * Expected: getId should return 'extractorId'
   */
  describe('getId', () => {
    it('should return id of the extractor', async () => {
      const data = extractor.getId();
      expect(data).toBe('extractorId');
    });
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
      const data = extractor.extractBoxData(permitBox);
      expect(data).toEqual(extractedPermit);
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
      const data = extractor.hasBoxData(permitBox);
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
        ...permitBox,
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
        ...permitBox,
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
        ...permitBox,
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
        ...permitBox,
        additionalRegisters: {
          R5: permitBox.additionalRegisters.R5,
        },
      };
      const data = extractor.hasBoxData(boxWithoutR4);
      expect(data).toEqual(false);
    });
  });
});
