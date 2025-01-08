import { DataSource } from 'typeorm';
import { createDatabase, generateBlockEntity } from '../utils.mock';
import { tokens } from '../tokens.mock';
import { TestAbstractObservationExtractor } from './TestAbstractObservationExtractor';
import { ExtractedObservation, ObservationEntity } from '../../../lib';
import { rosenData, tx } from './testData';
import { blake2b } from 'blakejs';
import { TokenMap } from '@rosen-bridge/tokens';
describe('AbstractObservationExtractor', () => {
  let dataSource: DataSource;
  let extractor: TestAbstractObservationExtractor;

  beforeEach(async () => {
    dataSource = await createDatabase();
    const tokenMap = new TokenMap();
    await tokenMap.updateConfigByJson(tokens);
    extractor = new TestAbstractObservationExtractor(dataSource, tokenMap, {
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

  describe('storeObservations', () => {
    /**
     * @target AbstractObservationExtractor.storeObservations
     * should store observations and call the registered callbacks
     * @dependencies
     * @scenario
     * - mock `callCallbacks`
     * - mock observation
     * - run test
     * - check database
     * - check if function got called
     * @expected
     * - observation should be inserted into database
     * - `callCallbacks` should have been called
     */
    it('should store observations and call the registered callbacks', async () => {
      const observation: ExtractedObservation = {
        fromChain: extractor.FROM_CHAIN,
        toChain: rosenData.toChain,
        fromAddress: rosenData.fromAddress,
        toAddress: rosenData.toAddress,
        amount: rosenData.amount,
        networkFee: rosenData.networkFee,
        bridgeFee: rosenData.bridgeFee,
        sourceChainTokenId: rosenData.sourceChainTokenId,
        targetChainTokenId: rosenData.targetChainTokenId,
        sourceBlockId: 'source-block-id',
        sourceTxId: 'txHash',
        requestId: Buffer.from(blake2b('txHash', undefined, 32)).toString(
          'hex'
        ),
      };
      const callerSpy = jest.spyOn(extractor, 'callCallbacks');
      const block = generateBlockEntity(dataSource, 'block-id');
      await extractor.callStoreObservations([observation], block);

      const repository = dataSource.getRepository(ObservationEntity);
      const [rows, rowsCount] = await repository.findAndCount();
      expect(rowsCount).toEqual(1);
      const observation1 = rows[0];
      expect(observation1).toEqual({
        id: 1,
        fromChain: observation.fromChain,
        toChain: observation.toChain,
        fromAddress: observation.fromAddress,
        toAddress: observation.toAddress,
        height: block.height,
        amount: observation.amount,
        networkFee: observation.networkFee,
        bridgeFee: observation.bridgeFee,
        sourceChainTokenId: observation.sourceChainTokenId,
        targetChainTokenId: observation.targetChainTokenId,
        sourceBlockId: observation.sourceBlockId,
        sourceTxId: observation.sourceTxId,
        block: block.hash,
        requestId: Buffer.from(
          blake2b(observation.sourceTxId, undefined, 32)
        ).toString('hex'),
        extractor: extractor.getId(),
      });

      expect(callerSpy).toHaveBeenCalled();
    });

    /**
     * @target AbstractObservationExtractor.storeObservations
     * should do nothing when no observation is extracted
     * @dependencies
     * @scenario
     * - mock `callCallbacks`
     * - run test with no observation
     * - check database
     * - check if function got called
     * @expected
     * - no observation should be in database
     * - `callCallbacks` should NOT have been called
     */
    it('should do nothing when no observation is extracted', async () => {
      const callerSpy = jest.spyOn(extractor, 'callCallbacks');
      const block = generateBlockEntity(dataSource, 'block-id');
      await extractor.callStoreObservations([], block);

      const repository = dataSource.getRepository(ObservationEntity);
      const [rows, rowsCount] = await repository.findAndCount();
      expect(rowsCount).toEqual(0);

      expect(callerSpy).not.toHaveBeenCalled();
    });
  });
});
