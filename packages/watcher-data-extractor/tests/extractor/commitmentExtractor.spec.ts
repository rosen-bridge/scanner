import { ErgoBoxInitializer } from '@rosen-bridge/abstract-extractor';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { ErgoNetworkType } from '@rosen-bridge/scanner-interfaces';
import { TokenMap } from '@rosen-bridge/tokens';

import CommitmentExtractor from '../../lib/extractor/commitmentExtractor';
import {
  commitmentBox,
  extractedCommitment,
} from './commitmentExtractorTestData';
import {
  block,
  commitmentAddress,
  eventTriggerAddress,
  RWTId,
} from './testData';
import { createDatabase } from './testUtils';

const { mockInitializeData } = vi.hoisted(() => ({
  mockInitializeData: vi.fn(),
}));
vi.mock('@rosen-bridge/abstract-extractor', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@rosen-bridge/abstract-extractor')>();
  return {
    ...actual,
    ErgoBoxInitializer: vi.fn(function () {
      return { initializeData: mockInitializeData };
    }),
  };
});

let dataSource: DataSource;
let extractor: CommitmentExtractor;

describe('commitmentExtractor', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mockInitializeData.mockResolvedValue(undefined);
    dataSource = await createDatabase();
    extractor = new CommitmentExtractor(
      'extractorId',
      [commitmentAddress],
      RWTId,
      dataSource,
      new TokenMap(),
      {
        active: true,
        type: ErgoNetworkType.Explorer,
        url: 'https://explorer.ergoplatform.com/',
      },
    );
  });

  describe('getId', () => {
    /**
     * @target getId should return the id of the extractor
     * @dependencies
     * @scenario
     * - calling getId of permitExtractor
     * @expected
     * - getId should return 'extractorId'
     */
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
      const data = extractor.extractBoxData(commitmentBox);
      expect(data).toEqual(extractedCommitment);
    });
  });

  describe('hasBoxData', () => {
    /**
     * @target hasBoxData should return true when the box has required ergoTree and token
     * @dependencies
     * @scenario
     * - create an extractor with required address and token
     * - run test (call `hasBoxData`)
     * @expected
     * - to return true
     */
    it('should return true when the box has required ergoTree and token', () => {
      const data = extractor.hasBoxData(commitmentBox);
      expect(data).toEqual(true);
    });

    /**
     * @target hasBoxData should return false when the box ergoTree is different
     * @dependencies
     * @scenario
     * - create an extractor with required address and token
     * - run test with different ergoTree (call `hasBoxData`)
     * @expected
     * - to return false
     */
    it('should return false when box ergoTree is different', () => {
      const boxWithDifferentErgoTree = {
        ...commitmentBox,
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
     * - create an extractor with required address and token
     * - run test with box without token (call `hasBoxData`)
     * @expected
     * - to return false
     */
    it("should return false when box doesn't have required token", () => {
      const boxWithoutToken = {
        ...commitmentBox,
        assets: [],
      };
      const data = extractor.hasBoxData(boxWithoutToken);
      expect(data).toEqual(false);
    });

    /**
     * @target hasBoxData should return false when box has different token
     * @dependencies
     * @scenario
     * - create an extractor with required address and token
     * - run test with box with different token (call `hasBoxData`)
     * @expected
     * - to return false
     */
    it('should return false when box has different token', () => {
      const boxWithDifferentToken = {
        ...commitmentBox,
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
     * - create an extractor with required address and token
     * - run test with box without R4 register (call `hasBoxData`)
     * @expected
     * - to return false
     */
    it('should return false when R4 register is missing', () => {
      const boxWithoutR4 = {
        ...commitmentBox,
        additionalRegisters: {
          R5: commitmentBox.additionalRegisters.R5,
          R6: commitmentBox.additionalRegisters.R6,
        },
      };
      const data = extractor.hasBoxData(boxWithoutR4);
      expect(data).toEqual(false);
    });

    /**
     * @target hasBoxData should return false when R5 register is missing
     * @dependencies
     * @scenario
     * - create an extractor with required address and token
     * - run test with box without R5 register (call `hasBoxData`)
     * @expected
     * - to return false
     */
    it('should return false when R5 register is missing', () => {
      const boxWithoutR5 = {
        ...commitmentBox,
        additionalRegisters: {
          R4: commitmentBox.additionalRegisters.R4,
          R6: commitmentBox.additionalRegisters.R6,
        },
      };
      const data = extractor.hasBoxData(boxWithoutR5);
      expect(data).toEqual(false);
    });

    /**
     * @target hasBoxData should return false when R6 register is missing
     * @dependencies
     * @scenario
     * - create an extractor with required address and token
     * - run test with box without R6 register (call `hasBoxData`)
     * @expected
     * - to return false
     */
    it('should return false when R6 register is missing', () => {
      const boxWithoutR6 = {
        ...commitmentBox,
        additionalRegisters: {
          R4: commitmentBox.additionalRegisters.R4,
          R5: commitmentBox.additionalRegisters.R5,
        },
      };
      const data = extractor.hasBoxData(boxWithoutR6);
      expect(data).toEqual(false);
    });
  });
  describe('initializeData', () => {
    const createExtractor = (addresses: string[], active: boolean) =>
      new CommitmentExtractor(
        'extractorId',
        addresses,
        RWTId,
        dataSource,
        new TokenMap(),
        {
          active,
          type: ErgoNetworkType.Explorer,
          url: 'https://explorer.ergoplatform.com/',
          maxParallelRequests: 5,
        },
      );

    /**
     * @target initializeData should run an initializer for each address
     * @dependencies
     * - ErgoBoxInitializer
     * @scenario
     * - mock ErgoBoxInitializer
     * - create an active extractor with two addresses
     * - run test (call `initializeData`)
     * @expected
     * - ErgoBoxInitializer to be constructed twice, once per address with
     *   the extractor's initialize options and callbacks
     * - initializeData of each initializer to be called with the initial block
     */
    it('should run an initializer for each address', async () => {
      const multiAddressExtractor = createExtractor(
        [commitmentAddress, eventTriggerAddress],
        true,
      );

      await multiAddressExtractor.initializeData(block);

      expect(ErgoBoxInitializer).toHaveBeenCalledTimes(2);
      [commitmentAddress, eventTriggerAddress].forEach((address, index) => {
        expect(ErgoBoxInitializer).toHaveBeenNthCalledWith(
          index + 1,
          ErgoNetworkType.Explorer,
          'https://explorer.ergoplatform.com/',
          address,
          'extractorId',
          multiAddressExtractor.hasBoxData,
          multiAddressExtractor.processTransactions,
          multiAddressExtractor.actions,
          5,
          expect.anything(),
        );
      });
      expect(mockInitializeData).toHaveBeenCalledTimes(2);
      expect(mockInitializeData).toHaveBeenCalledWith(block);
    });

    /**
     * @target initializeData should not initialize when initialization is inactive
     * @dependencies
     * - ErgoBoxInitializer
     * @scenario
     * - mock ErgoBoxInitializer
     * - create an inactive extractor
     * - run test (call `initializeData`)
     * @expected
     * - ErgoBoxInitializer not to be constructed
     * - no initializeData to be called
     */
    it('should not initialize when initialization is inactive', async () => {
      const inactiveExtractor = createExtractor([commitmentAddress], false);

      await inactiveExtractor.initializeData(block);

      expect(ErgoBoxInitializer).not.toHaveBeenCalled();
      expect(mockInitializeData).not.toHaveBeenCalled();
    });

    /**
     * @target initializeData should stop and throw when an address initialization fails
     * @dependencies
     * - ErgoBoxInitializer
     * @scenario
     * - mock ErgoBoxInitializer to reject on the first address
     * - create an active extractor with two addresses
     * - run test (call `initializeData`)
     * @expected
     * - initializeData to throw the initializer error
     * - the second address not to be initialized
     */
    it('should stop and throw when an address initialization fails', async () => {
      mockInitializeData.mockRejectedValueOnce(new Error('network error'));
      const multiAddressExtractor = createExtractor(
        [commitmentAddress, eventTriggerAddress],
        true,
      );

      await expect(multiAddressExtractor.initializeData(block)).rejects.toThrow(
        'network error',
      );

      expect(ErgoBoxInitializer).toHaveBeenCalledTimes(1);
      expect(mockInitializeData).toHaveBeenCalledTimes(1);
    });
  });
});
