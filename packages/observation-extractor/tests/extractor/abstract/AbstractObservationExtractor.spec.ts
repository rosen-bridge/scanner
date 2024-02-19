import { DataSource } from 'typeorm';
import { RosenData } from '@rosen-bridge/rosen-extractor';
import { createDatabase, generateBlockEntity } from '../utils.mock';
import { tokens } from '../tokens.mock';
import {
  TestAbstractObservationExtractor,
  TestTransactionType,
} from './TestAbstractObservationExtractor';
import { ObservationEntity } from '../../../lib';
import { rosenData, tx } from './testData';
import { blake2b } from 'blakejs';

describe('AbstractObservationExtractor', () => {
  let dataSource: DataSource;
  let extractor: TestAbstractObservationExtractor;

  beforeEach(async () => {
    dataSource = await createDatabase();
    extractor = new TestAbstractObservationExtractor(dataSource, tokens, {
      get: jest.fn(),
    } as any);
  });

  describe('processTransactions', () => {
    /**
     * @target AbstractObservationExtractor.processTransactions
     * should return true and insert observation into database on valid lock tx
     * @dependencies
     * @scenario
     * - mock rosen-extractor to return rosen data
     * - run test
     * - check returned value
     * - check database
     * @expected
     * - it should return true
     * - observation should be inserted into database
     */
    it('should return true and insert observation into database on valid lock tx', async () => {
      jest
        .spyOn(extractor.getRosenExtractor(), 'get')
        .mockReturnValue(rosenData);

      // run test
      const res = await extractor.processTransactions(
        [tx],
        generateBlockEntity(dataSource, 'block-id')
      );

      // check returned valid
      expect(res).toEqual(true);

      // check database
      const repository = dataSource.getRepository(ObservationEntity);
      const [rows, rowsCount] = await repository.findAndCount();
      expect(rowsCount).toEqual(1);
      const observation1 = rows[0];
      const txHash = tx.txId;
      expect(observation1).toEqual({
        id: 1,
        fromChain: extractor.FROM_CHAIN,
        toChain: rosenData.toChain,
        fromAddress: rosenData.fromAddress,
        toAddress: rosenData.toAddress,
        height: 1,
        amount: rosenData.amount,
        networkFee: rosenData.networkFee,
        bridgeFee: rosenData.bridgeFee,
        sourceChainTokenId: rosenData.sourceChainTokenId,
        targetChainTokenId: rosenData.targetChainTokenId,
        sourceBlockId: 'block-id',
        sourceTxId: txHash,
        block: 'block-id',
        requestId: Buffer.from(blake2b(txHash, undefined, 32)).toString('hex'),
        extractor: extractor.getId(),
      });
    }, 100000);

    /**
     * @target AbstractObservationExtractor.processTransactions
     * should return true with no observation in database on invalid lock tx
     * @dependencies
     * @scenario
     * - mock rosen-extractor to return undefined
     * - run test
     * - check returned value
     * - check database
     * @expected
     * - it should return true
     * - no observation should be in database
     */
    it('should return true with no observation in database on invalid lock tx', async () => {
      jest
        .spyOn(extractor.getRosenExtractor(), 'get')
        .mockReturnValue(undefined);

      const res = await extractor.processTransactions(
        [tx],
        generateBlockEntity(dataSource, 'block-id')
      );

      // check returned valid
      expect(res).toEqual(true);

      // check database
      const repository = dataSource.getRepository(ObservationEntity);
      const [rows, rowsCount] = await repository.findAndCount();
      expect(rowsCount).toEqual(0);
    }, 100000);
  });
});
