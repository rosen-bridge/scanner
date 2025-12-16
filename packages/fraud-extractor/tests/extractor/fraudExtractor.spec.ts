import { DataSource } from '@rosen-bridge/extended-typeorm';
import { ErgoNetworkType } from '@rosen-bridge/scanner-interfaces';

import { FraudExtractor } from '../../lib';
import { createDatabase } from './fraudExtractor.mock';
import { extractedFraud, fraudTx } from './testData';

let dataSource: DataSource;
let extractor: FraudExtractor;

describe('FraudExtractor', () => {
  beforeEach(async () => {
    dataSource = await createDatabase();
    extractor = new FraudExtractor(
      dataSource,
      'extractor1',
      'https://explorer.ergoplatform.com/',
      ErgoNetworkType.Explorer,
      '2U1Bm1VfBKJQzNr6Zu6yAh2ZUvdj3LbyQDqtkC3KWmmMoHNwSRTTF1xZ54auFAShAe9Rh1HGkWnGgFiWvGjyYjDjen8j1Qn5mDQGvvrRtR5msj5kbZtiTkLAQ2SB8WBJvW9e4QHdWa2wPnyfe9KMFHMYtcEgdUA2wD4NyvyWNe31R2bxsMykcaxi49WdbWYENRK3WfZ7udYGcsJyKNN2kwpWyyC3ErnLuJNbmeNGFy4QxvKMtcpfZSg',
      '34529f875cad2bf58c5ffb4a9056d26c590f0c35f77958a68dcdb4aa39b437aa',
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
      const data = extractor.extractBoxData(fraudTx.outputs[0], [], {
        triggerBoxId: fraudTx.inputs[0].boxId,
      });
      expect(data).toEqual(extractedFraud);
    });

    /**
     * @target extractBoxData should throw error when triggerBoxId is missing
     * @dependencies
     * @scenario
     * - run test for a box without triggerBoxId (call `extractBoxData`)
     * @expected
     * - throw an error with message about missing trigger box ID
     */
    it('should throw error when triggerBoxId is missing', () => {
      expect(() => {
        extractor.extractBoxData(fraudTx.outputs[0], [], {});
      }).toThrow('ImpossibleBehaviour: Trigger box ID is missing');
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
      const data = extractor.hasBoxData(fraudTx.outputs[0]);
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
        ...fraudTx.outputs[0],
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
        ...fraudTx.outputs[0],
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
        ...fraudTx.outputs[0],
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
        ...fraudTx.outputs[0],
        additionalRegisters: {},
      };
      const data = extractor.hasBoxData(boxWithoutR4);
      expect(data).toEqual(false);
    });
  });
});
