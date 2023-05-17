import { ErgoObservationExtractor } from '../../../lib';
import {
  generateBlockEntity,
  loadDataBase,
  observationTxGenerator,
} from '../utils.mock';
import { ObservationEntity } from '../../../lib';
import { tokens } from '../tokens.mock';
import { Buffer } from 'buffer';
import { blake2b } from 'blakejs';
import { CARDANO_NATIVE_TOKEN } from '../../../lib/extractor/const';

class ExtractorErgo extends ErgoObservationExtractor {}

const bankAddress = '9f53ZBeKFk3VKS4KPj1Lap96BKFSw8zfdWb4FHYZH6qBBV6p9ZS';
const bankSK =
  'f133100250abf1494e9ff5a0f998dc2fea7a5aa35641454ba723c913bff0e8fa';
const watcherAddress = '9i1EZHaRPTLajwJivCFpdoi65r7A8ZgJxVbMtxZ23W5Z2gDkKdM';
const watcherSK =
  '3870dab5e5fb3eebfdcb30031b65a8dbb8eec75ffe3558e7d0c7ef9529984ee1';

describe('extractorErgo', () => {
  describe('processTransactions', () => {
    /**
     * 1 Valid Transaction should save successfully
     * Dependency: action.storeObservations
     * Scenario: one valid observation should save successfully
     * Expected: processTransactions should returns true and database row count should be 1 and database fields
     *  should fulfill expected values
     */
    it('checks valid transaction', async () => {
      const dataSource = await loadDataBase();
      const extractor = new ExtractorErgo(dataSource, tokens, bankAddress);
      const Tx1 = observationTxGenerator(
        true,
        [
          'cardano',
          'address',
          '10000',
          '1000',
          '9i1EZHaRPTLajwJivCFpdoi65r7A8ZgJxVbMtxZ23W5Z2gDkKdM',
        ],
        bankSK,
        watcherSK
      );
      const Tx2 = observationTxGenerator(
        true,
        ['cardano', 'address', '10000', '1000'],
        bankSK,
        watcherSK
      );
      const Tx3 = observationTxGenerator(
        false,
        [
          'cardano',
          'address',
          '10000',
          '1000',
          '9i1EZHaRPTLajwJivCFpdoi65r7A8ZgJxVbMtxZ23W5Z2gDkKdM',
        ],
        bankSK,
        watcherSK
      );
      const res = await extractor.processTransactions(
        [Tx1, Tx2, Tx3],
        generateBlockEntity(dataSource, '1')
      );
      expect(res).toBeTruthy();
      const repository = dataSource.getRepository(ObservationEntity);
      const [rows, rowsCount] = await repository.findAndCount();
      expect(rowsCount).toEqual(2);
      const observation1 = rows[0];
      const box1 = Tx1.outputs[0];
      const assetAmount = box1.assets ? box1.assets[0].amount.toString() : '';
      const assetId = box1.assets ? box1.assets[0].tokenId : '';
      expect(observation1).toEqual({
        id: 1,
        fromChain: 'ergo',
        toChain: 'cardano',
        fromAddress: watcherAddress,
        toAddress: 'address',
        height: 1,
        amount: assetAmount,
        networkFee: '10000',
        bridgeFee: '1000',
        sourceChainTokenId: assetId,
        targetChainTokenId: CARDANO_NATIVE_TOKEN,
        sourceBlockId: '1',
        sourceTxId: box1.transactionId,
        requestId: Buffer.from(
          blake2b(box1.transactionId, undefined, 32)
        ).toString('hex'),
        block: '1',
        extractor: 'ergo-observation-extractor',
      });
    });

    /**
     * 1 Valid Transaction but invalid bankAddress should not save
     * Dependency: action.storeObservations
     * Scenario: one valid observation with invalid bankAddress should not save in the database
     * Expected: processTransactions should returns true and database row count should be 0
     */
    it('checks observation with invalid bankAddress should not saved', async () => {
      const dataSource = await loadDataBase();
      const extractor = new ExtractorErgo(
        dataSource,
        tokens,
        '9gDQ7emWoxJkAHW8kSwniCkDa43G2w9LCL9voHgfj2AvXfFSQ8i'
      );
      const Tx1 = observationTxGenerator(
        true,
        ['cardano', 'address', '10000', '1000', watcherAddress],
        bankSK,
        watcherSK
      );
      const res = await extractor.processTransactions(
        [Tx1],
        generateBlockEntity(dataSource, '1')
      );
      expect(res).toEqual(true);
      const repository = dataSource.getRepository(ObservationEntity);
      const [, rowsCount] = await repository.findAndCount();
      expect(rowsCount).toEqual(0);
    });
  });
});
