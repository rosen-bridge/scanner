import { DataSource } from 'typeorm';
import { loadDataBase, clearDB } from '../utils.mock';
import { CardanoOgmiosObservationExtractor } from './ogmios';
import { tokens } from '../tokens.mocked';
import { AuxiliaryDatas, OgmiosBoxes, Transactions } from './ogmios.mock';
import { BlockEntity, PROCEED } from '@rosen-bridge/scanner';
import { ObservationEntity } from '../../entities/observationEntity';

let dataSource: DataSource;
let extractor: CardanoOgmiosObservationExtractor;
const bankAddress =
  'addr1v8xputtxppjx9f255nqgz0xv9cquqm4ndemd659zdz4nznc7guuzv';

describe('CardanoOgmiosObservationExtractor', () => {
  beforeAll(async () => {
    dataSource = await loadDataBase('generalScanner');
    extractor = new CardanoOgmiosObservationExtractor(
      dataSource,
      tokens,
      bankAddress
    );
  });

  beforeEach(async () => {
    await clearDB(dataSource);
  });

  describe('getObjectKeyAsStringOrUndefined', () => {
    /**
     *  Test returning value from json
     *  Dependency: Nothing
     *  Scenario: Try to get value of key1
     *  Expected: value1
     */
    it('should return field value in json when exists', () => {
      const val = { key1: 'value1', key2: 'value2' };
      expect(extractor.getObjectKeyAsStringOrUndefined(val, 'key1')).toEqual(
        'value1'
      );
    });

    /**
     *  Test returning undefined when key does not exist in json
     *  Dependency: Nothing
     *  Scenario: Try to get value of key3
     *  Expected: undefined
     */
    it('should return undefined when one key does not exists', () => {
      const val = { key1: 'value1', key2: 'value2' };
      expect(
        extractor.getObjectKeyAsStringOrUndefined(val, 'key3')
      ).toBeUndefined();
    });

    /**
     *  Test returning undefined when value is not string
     *  Dependency: Nothing
     *  Scenario: Try to get value of key2
     *  Expected: undefined
     */
    it('should return undefined when value is not string', () => {
      const val = { key1: 'value1', key2: [] };
      expect(
        extractor.getObjectKeyAsStringOrUndefined(val, 'key2')
      ).toBeUndefined();
    });
  });

  describe('getTokenDetail', () => {
    /**
     * Test when box have not token must return lovelace value
     * Dependency: Nothing
     * Scenario: try getting information from a box without tokens
     * Expected: lovelace amount
     */
    it('should return lovelace when no token', () => {
      const result = extractor.getTokenDetail(OgmiosBoxes.notTokenBox, 'ergo');
      expect(result).toEqual({
        from: 'lovelace',
        to: 'f6a69529b12a7e2326acffee8383e0c44408f87a872886fadf410fe8498006d3',
        amount: '115300000',
      });
    });

    /**
     * Test when box contain invalid token must return lovelace value
     * Dependency: Nothing
     * Scenario: try to get information of a box with unknown token
     * Expected: lovelace amount
     */
    it('should return lovelace when token is invalid', () => {
      const result = extractor.getTokenDetail(OgmiosBoxes.invalidToken, 'ergo');
      expect(result).toEqual({
        from: 'lovelace',
        to: 'f6a69529b12a7e2326acffee8383e0c44408f87a872886fadf410fe8498006d3',
        amount: '115300000',
      });
    });

    /**
     * Test returning token
     * Dependency: Nothing
     * Scenario: try to get information of a box with valid token
     * Expected: token information
     */
    it('should return token information when exists', () => {
      const result = extractor.getTokenDetail(OgmiosBoxes.withToken, 'ergo');
      expect(result).toEqual({
        from: 'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2',
        to: 'erg',
        amount: '12000000000',
      });
    });
  });

  describe('getRosenData', () => {
    /**
     * Test return valid Rosen data
     * Dependency: Nothing
     * Scenario: try getting rosen data from valid transaction metadata
     * Expected: valid rosen data
     */
    it('should return valid rosen data', () => {
      const res = extractor.getRosenData(AuxiliaryDatas.validEvent);
      expect(res).toEqual({
        bridgeFee: '3000',
        fromAddress:
          '7bb715ce7d410747beb98cb6fb322a5865894018433eb115d67625c5befb6f61',
        networkFee: '300',
        toAddress: '9hZxV3YNSfbCqS6GEses7DhAVSatvaoNtdsiNvkimPGG2c8fzkG',
        toChain: 'ergo',
      });
    });

    /**
     * Test return valid undefined when no blob available
     * Dependency: Nothing
     * Scenario: try getting rosen data from a transaction metadata without blob
     * Expected: return undefined
     */
    it('should return valid rosen data', () => {
      const res = extractor.getRosenData(AuxiliaryDatas.noBlob);
      expect(res).toBeUndefined();
    });

    /**
     * Target:
     * It should return `undefined` if `blob['0']` doesn't exist
     *
     * Dependencies:
     * N/A
     *
     * Scenario:
     * N/A
     *
     * Expected output:
     * It should return `undefined`
     */
    it("should return `undefined` if `blob['0']` doesn't exist", () => {
      const res = extractor.getRosenData(AuxiliaryDatas.noBlobZeroKey);
      expect(res).toBeUndefined();
    });

    /**
     * Test return valid undefined when blob index 0 contain no json value
     * Dependency: Nothing
     * Scenario: try getting rosen data from a transaction metadata blob contain only strings
     * Expected: return undefined
     */
    it('should return valid rosen data', () => {
      const res = extractor.getRosenData(AuxiliaryDatas.noJson);
      expect(res).toBeUndefined();
    });
  });

  describe('processTransactions', () => {
    beforeEach(async () => {
      await dataSource.getRepository(BlockEntity).clear();
      await dataSource.getRepository(BlockEntity).insert({
        hash: '340df860ccefa2ee3a65ac85a44116e9c4b49ec0a19367e23e56d30fa9d13f99',
        parentHash:
          '524f4d5771f2db22ba17b4889412597d05c3c1a95c3964ecce576eebf2c7c110',
        height: 7991037,
        scanner: 'testscanner',
        status: PROCEED,
      });
    });
    /**
     * Test when block contain valid transaction it must store observation into database.
     * Dependency: Block contain valid transaction
     * Scenario: pass a valid transaction to method. then get observation from database
     * Expected: one observation in database
     */
    it('should store observation in database from valid transaction', async () => {
      const block = (await dataSource.getRepository(BlockEntity).find())[0];
      await extractor.processTransactions([Transactions.valid], block);
      const observations = await dataSource
        .getRepository(ObservationEntity)
        .find();
      expect(observations.length).toEqual(1);
      const observation = observations[0];
      observation.id = 0;
      expect(observations[0]).toEqual({
        amount: '1344798',
        block:
          '340df860ccefa2ee3a65ac85a44116e9c4b49ec0a19367e23e56d30fa9d13f99',
        bridgeFee: '3000',
        extractor: 'ergo-cardano-ogmios-extractor',
        fromAddress:
          '7bb715ce7d410747beb98cb6fb322a5865894018433eb115d67625c5befb6f61',
        fromChain: 'cardano',
        height: 7991037,
        id: 0,
        networkFee: '300',
        requestId:
          '5670b92f077a6abb051e69f125a7337399afca4f062c8ee2edcaaf2796ace470',
        sourceBlockId:
          '340df860ccefa2ee3a65ac85a44116e9c4b49ec0a19367e23e56d30fa9d13f99',
        sourceChainTokenId: 'lovelace',
        sourceTxId:
          '55ec4f12b1a8656e07bc5e4281af3c12bf7b63bf39811eb5762a2f522be2600f',
        targetChainTokenId:
          'f6a69529b12a7e2326acffee8383e0c44408f87a872886fadf410fe8498006d3',
        toAddress: '9hZxV3YNSfbCqS6GEses7DhAVSatvaoNtdsiNvkimPGG2c8fzkG',
        toChain: 'ergo',
      });
    });

    /**
     * Test when transaction metadata is null no observation must store in database
     * Dependency: Nothing
     * Scenario: pass expected transaction to method
     * Expected: no observation saved to database
     */
    it('should not save observation when metadata is null', async () => {
      const block = (await dataSource.getRepository(BlockEntity).find())[0];
      await extractor.processTransactions([Transactions.noMetadata], block);
      expect(await dataSource.getRepository(ObservationEntity).count()).toEqual(
        0
      );
    });

    /**
     * Test when transaction metadata is contain invalid rosen data no observation must store in database
     * Dependency: Nothing
     * Scenario: pass expected transaction to method
     * Expected: no observation saved to database
     */
    it('should not save observation when metadata is null', async () => {
      const block = (await dataSource.getRepository(BlockEntity).find())[0];
      await extractor.processTransactions(
        [Transactions.invalidMetadata],
        block
      );
      expect(await dataSource.getRepository(ObservationEntity).count()).toEqual(
        0
      );
    });

    /**
     * Test when transaction output[0] send to invalid address
     * Dependency: Nothing
     * Scenario: pass expected transaction to method
     * Expected: no observation saved to database
     */
    it('should not save observation when metadata is null', async () => {
      const block = (await dataSource.getRepository(BlockEntity).find())[0];
      await extractor.processTransactions([Transactions.invalidAddress], block);
      expect(await dataSource.getRepository(ObservationEntity).count()).toEqual(
        0
      );
    });
  });
});
