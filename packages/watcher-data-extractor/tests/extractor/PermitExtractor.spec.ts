import { DataSource } from 'typeorm';

import { createDatabase } from './utilsFunctions.mock';
import PermitExtractor from '../../lib/extractor/PermitExtractor';
import {
  permitBoxes,
  permitAddress,
  RWTId,
  extractedPermit,
} from './utilsVariable.mock';
import { ErgoNetworkType } from '@rosen-bridge/abstract-extractor';

jest.mock('@rosen-clients/ergo-explorer');
let dataSource: DataSource;

describe('permitExtractor', () => {
  beforeEach(async () => {
    dataSource = await createDatabase();
  });

  describe('getId', () => {
    /**
     * @target getId should return permit extractor id
     * @dependencies
     * @scenario
     * - call getId
     * @expected
     * - return the permit extractor id
     */
    it('should return permit extractor id', async () => {
      const extractor = new PermitExtractor(
        'extractorId',
        dataSource,
        ErgoNetworkType.Explorer,
        'explorerUrl',
        permitAddress,
        RWTId
      );
      const data = extractor.getId();
      expect(data).toBe('extractorId');
    });
  });

  describe('hasData', () => {
    /**
     * @target hasData should return true when box has correct format
     * @dependencies
     * @scenario
     * - mock a valid permit box
     * - call hasData
     * @expected
     * - return true
     */
    it('should return true when box has correct format', async () => {
      const extractor = new PermitExtractor(
        'extractorId',
        dataSource,
        ErgoNetworkType.Explorer,
        'explorerUrl',
        permitAddress,
        RWTId
      );
      const result = extractor.hasData(permitBoxes.items[0]);
      expect(result).toEqual(true);
    });

    /**
     * @target hasData should return true when box has different address
     * @dependencies
     * @scenario
     * - create extractor instance with different permit address
     * - call hasData
     * @expected
     * - return true
     */
    it('should return false when box has different address', async () => {
      const extractor = new PermitExtractor(
        'extractorId',
        dataSource,
        ErgoNetworkType.Explorer,
        'explorerUrl',
        'EE7687i4URb4YuSGSQXPCbAgnr73Bb67aXgwzpjguuNwyRrWwVamRPKsiE3hbewDFDzkQa2PDdQG1S3KGcPbbPqvaT15RXFcCELtrAJ5BeZJFf9EfumFNWKztr7Me5Z23TRUPNgbcYEpCkC3RJeui3Tv6jXbEF2v284inu65FisnWoicPvpbuJb3fHpLkr5JAFPcp6uGTqTaaNWMJxWrHRbpKtvwVjG2VibGBGZJPtMbG3pzryH7Aq6CtLKtCAkSivDUkQWbXpm7TuvMnRCL78LvdoqauB8fRHxxxMw5BbmhVqBsKigUa92WBJCdyM7efp5SM1EXvNskbDEtuHHiYbLPxBJHXvZWWa8XCKvbWVV5eWdWExzASe3KzPCDEFm5JY2Peq64SY5gz6yu9n23BxDtb7PueWCMYfJs2VaYcLbndFJpkcDJKDiaEm18wSd3oKQ9eENKNZ74H2JyqmjnX6yVXcecP6NUj5gE3N2b5Pm5MjL37wveibdWHeSRQZFepWQdVAK5TLTgDL9YEE4jv5RLqB6vZ5eMtfSjhZ2',
        RWTId
      );
      const result = extractor.hasData(permitBoxes.items[0]);
      expect(result).toEqual(false);
    });

    /**
     * @target hasData should return true when box has different rwt token
     * @dependencies
     * @scenario
     * - create extractor instance with different permit rwt token
     * - call hasData
     * @expected
     * - return true
     */
    it('should return false when box has different rwt token', async () => {
      const extractor = new PermitExtractor(
        'extractorId',
        dataSource,
        ErgoNetworkType.Explorer,
        'explorerUrl',
        permitAddress,
        'c5c6e337aa9bebf87b1f174e1bc1c3019be44ebf72de5b55fbbdcd1f659b4881'
      );
      const result = extractor.hasData(permitBoxes.items[0]);
      expect(result).toEqual(false);
    });
  });

  describe('extractBoxData', () => {
    /**
     * @target extractBoxData should extract permit data from output box
     * @dependencies
     * @scenario
     * - call extractBoxData with output box
     * - check the extract info
     * @expected
     * - should extract permit data from output box
     */
    it('should extract permit data from api output', async () => {
      const extractor = new PermitExtractor(
        'extractor1',
        dataSource,
        ErgoNetworkType.Explorer,
        'explorerUrl',
        permitAddress,
        'RWT'
      );
      const boxData = await extractor.extractBoxData(permitBoxes.items[0]);
      expect(boxData).toEqual(extractedPermit);
    });
  });
});
