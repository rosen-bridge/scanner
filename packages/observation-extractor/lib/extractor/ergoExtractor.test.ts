import { ErgoObservationExtractor } from './ergoExtractor';
import {
  generateBlockEntity,
  loadDataBase,
  observationTxGenerator,
} from './utils.mock';
import { ObservationEntity } from '../entities/observationEntity';
import { tokens } from './tokens.mocked';
import { Buffer } from 'buffer';
import { blake2b } from 'blakejs';
import { CARDANO_NATIVE_TOKEN, ERGO_NATIVE_TOKEN } from './const';

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
      const dataSource = await loadDataBase('processTransactionErgo');
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
      const dataSource = await loadDataBase(
        'processTransactionErgo-invalidBankAddress'
      );
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

  describe('getRosenData', () => {
    /**
     * Test that valid Rosen output box find successfully
     * Dependency: Nothing
     * Scenario: valid Rosen Output box pass to the function
     * Expected: function returns rosenData object
     */
    it('valid transaction token locked', async () => {
      const dataSource = await loadDataBase('getRosenData-ergo');
      const extractor = new ExtractorErgo(dataSource, tokens, bankAddress);
      const Tx = observationTxGenerator(
        true,
        ['cardano', 'address', '10000', '1000', watcherAddress],
        bankSK,
        watcherSK
      );
      expect(extractor.getTransferData(Tx.outputs[0])).toStrictEqual({
        toChain: 'cardano',
        toAddress: 'address',
        bridgeFee: '1000',
        networkFee: '10000',
        fromAddress: watcherAddress,
        amount: BigInt(10),
        tokenId:
          'f6a69529b12a7e2326acffee8383e0c44408f87a872886fadf410fe8498006d3',
      });
    });

    /**
     * Test that valid Rosen output box find successfully when ergo locked
     * Dependency: Nothing
     * Scenario: valid Rosen Output box pass to the function
     * Expected: function returns rosenData object
     */
    it('valid transaction ergo locked', async () => {
      const dataSource = await loadDataBase('getRosenData-ergo');
      const extractor = new ExtractorErgo(dataSource, tokens, bankAddress);
      const Tx = observationTxGenerator(
        false,
        ['cardano', 'address', '10000', '1000', watcherAddress],
        bankSK,
        watcherSK,
        '100000000000'
      );
      expect(extractor.getTransferData(Tx.outputs[0])).toStrictEqual({
        toChain: 'cardano',
        toAddress: 'address',
        bridgeFee: '1000',
        networkFee: '10000',
        fromAddress: watcherAddress,
        amount: BigInt('100000000000'),
        tokenId: ERGO_NATIVE_TOKEN,
      });
    });

    /**
     * Test that invalid Rosen output box find successfully
     * Dependency: Nothing
     * Scenario: invalid Rosen Output box pass to the function there is incorrect register value
     * Expected: function returns false
     */
    it('checks transaction without valid register value', async () => {
      const dataSource = await loadDataBase('getRosenData');
      const extractor = new ExtractorErgo(dataSource, tokens, bankAddress);
      const Tx = observationTxGenerator(
        true,
        ['Cardano', 'address', '10000'],
        bankSK,
        watcherSK
      );
      expect(extractor.getTransferData(Tx.outputs[0])).toEqual(undefined);
    });
  });
});
