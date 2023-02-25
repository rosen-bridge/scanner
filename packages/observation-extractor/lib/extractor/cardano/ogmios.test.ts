import { DataSource } from 'typeorm';
import { loadDataBase, clearDB } from '../utils.mock';
import { CardanoOgmiosObservationExtractor } from './ogmios';
import { tokens } from '../tokens.mocked';
import { Transactions } from './ogmios.mock';
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
