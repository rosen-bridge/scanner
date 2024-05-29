import { DataSource } from 'typeorm';
import * as ergoLib from 'ergo-lib-wasm-nodejs';

import { ErgoUTXOExtractor } from '../../lib';
import { createDatabase } from './utils.mock';
import { extractedBox, tx1 } from './testData';
import { ErgoNetworkType } from '@rosen-bridge/abstract-extractor';

let dataSource: DataSource;
let extractor: ErgoUTXOExtractor;

describe('AddressExtractor', () => {
  beforeEach(async () => {
    dataSource = await createDatabase();
    extractor = new ErgoUTXOExtractor(
      dataSource,
      'extractor1',
      ergoLib.NetworkPrefix.Mainnet,
      'https://explorer.ergoplatform.com/',
      ErgoNetworkType.Explorer,
      '9hdcMw4sc8a8kUv7RLKomSsBCP5xc6fJ9HwR8tJf8kJLaJh4fY2'
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
      const data = extractor.extractBoxData(tx1.outputs[0], 'blockId', 100);
      expect(data).toEqual(extractedBox);
    });
  });

  describe('hasData', () => {
    /**
     * @target hasData should return true when the box address is the same
     * @dependencies
     * @scenario
     * - mock extractor with required address
     * - run test (call `hasData`)
     * @expected
     * - to return true
     */
    it('should return true when the box address is the same', () => {
      const data = extractor.hasData(tx1.outputs[0]);
      expect(data).toEqual(true);
    });

    /**
     * @target hasData should return false when the box address is different
     * @dependencies
     * @scenario
     * - mock extractor with required address
     * - run test (call `hasData`)
     * @expected
     * - to return false
     */
    it('should return false when box address is different', () => {
      const data = extractor.hasData(tx1.outputs[1]);
      expect(data).toEqual(false);
    });

    /**
     * @target hasData should return true when the box has required token and address
     * @dependencies
     * @scenario
     * - mock extractor with required address and token
     * - run test (call `hasData`)
     * @expected
     * - to return true
     */
    it('should return true when box has required token and address', () => {
      extractor = new ErgoUTXOExtractor(
        dataSource,
        'extractor1',
        ergoLib.NetworkPrefix.Mainnet,
        'https://explorer.ergoplatform.com/',
        ErgoNetworkType.Explorer,
        '9hdcMw4sc8a8kUv7RLKomSsBCP5xc6fJ9HwR8tJf8kJLaJh4fY2',
        ['ba698c3c943e06ad224d42c736826f8dc38981fb92814f577a89c0ad9361c367']
      );
      const data = extractor.hasData(tx1.outputs[0]);
      expect(data).toEqual(true);
    });

    /**
     * @target hasData should return true when the box has required token
     * @dependencies
     * @scenario
     * - mock extractor with required token
     * - run test (call `hasData`)
     * @expected
     * - to return true
     */
    it('should return true when box has required token', () => {
      extractor = new ErgoUTXOExtractor(
        dataSource,
        'extractor1',
        ergoLib.NetworkPrefix.Mainnet,
        'https://explorer.ergoplatform.com/',
        ErgoNetworkType.Explorer,
        '',
        ['ba698c3c943e06ad224d42c736826f8dc38981fb92814f577a89c0ad9361c367']
      );
      const data = extractor.hasData(tx1.outputs[3]);
      expect(data).toEqual(true);
    });

    /**
     * @target hasData should return false when box doesn't have required token
     * @dependencies
     * @scenario
     * - mock extractor with required token
     * - run test (call `hasData`)
     * @expected
     * - to return false
     */
    it("should return false when box doesn't have required token", () => {
      extractor = new ErgoUTXOExtractor(
        dataSource,
        'extractor1',
        ergoLib.NetworkPrefix.Mainnet,
        'https://explorer.ergoplatform.com/',
        ErgoNetworkType.Explorer,
        '',
        ['ba698c3c943e06ad224d42c736826f8dc38981fb92814f577a89c0ad9361c367']
      );
      const data = extractor.hasData(tx1.outputs[1]);
      expect(data).toEqual(false);
    });

    /**
     * @target hasData should return true when the box has required token but the address is different
     * @dependencies
     * @scenario
     * - mock extractor with required address and token
     * - run test (call `hasData`)
     * @expected
     * - to return false
     */
    it('should return false when box has required token but the address is different', () => {
      extractor = new ErgoUTXOExtractor(
        dataSource,
        'extractor1',
        ergoLib.NetworkPrefix.Mainnet,
        'https://explorer.ergoplatform.com/',
        ErgoNetworkType.Explorer,
        '9hdcMw4sc8a8kUv7RLKomSsBCP5xc6fJ9HwR8tJf8kJLaJh4fY2',
        ['ba698c3c943e06ad224d42c736826f8dc38981fb92814f577a89c0ad9361c367']
      );
      const data = extractor.hasData(tx1.outputs[3]);
      expect(data).toEqual(false);
    });
  });
});
