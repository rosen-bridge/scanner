import { DataSource } from 'typeorm';
import { createDatabase } from '../utils.mock';
import { CardanoOgmiosObservationExtractor } from '../../../lib';
import { tokens } from '../tokens.mock';
import { Transactions } from './ogmios.mock';
import { BlockEntity, PROCEED } from '@rosen-bridge/scanner';
import { ObservationEntity } from '../../../lib';

let dataSource: DataSource;
let extractor: CardanoOgmiosObservationExtractor;
const bankAddress =
  'addr1v9kmp9flrq8gzh287q4kku8vmad3vkrw0rwqvjas6vyrf9s9at4dn';

describe('CardanoOgmiosObservationExtractor', () => {
  beforeEach(async () => {
    dataSource = await createDatabase();
    extractor = new CardanoOgmiosObservationExtractor(
      dataSource,
      tokens,
      bankAddress
    );
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
        timestamp: 20,
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
        amount: '14271656',
        block:
          '340df860ccefa2ee3a65ac85a44116e9c4b49ec0a19367e23e56d30fa9d13f99',
        bridgeFee: '6800501',
        extractor: 'cardano-ogmios-extractor',
        fromAddress:
          'addr1q8hmp5zjzvv7s7pmgemz3mvrkd2nu7609hwgsqa0auf6h7h3r6x6jn2zrt8',
        fromChain: 'cardano',
        height: 7991037,
        id: 0,
        networkFee: '34003',
        requestId:
          '26bceacc7398183932bb22c7fbd2ca148c5006d329c111930d848beed24028a9',
        sourceBlockId:
          '340df860ccefa2ee3a65ac85a44116e9c4b49ec0a19367e23e56d30fa9d13f99',
        sourceChainTokenId: 'ada',
        sourceTxId:
          '07c446bd320e3c2cf7cf11de7dcba5407828602f69c7684cf4d1ec1cfaf66557',
        targetChainTokenId:
          'f6a69529b12a7e2326acffee8383e0c44408f87a872886fadf410fe8498006d3',
        toAddress: '9iD5jMoLjK9azTdigyT8z1QY6qHrA6gVrJamMF8MJ2qt45pJpDc',
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
