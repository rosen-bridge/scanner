import { vi } from 'vitest';
import { DataSource } from 'typeorm';
import { blake2b } from 'blakejs';
import { ObservationEntity } from '@rosen-bridge/observation-extractor';
import { createDatabase, generateBlockEntity } from './utils.mock';
import { rosenData, tx, txRes } from './testData';
import { TestEvmRpcObservationExtractor } from './TestObservationExtractor';

vi.mock('ethers', async (importOriginal) => {
  const ref = await importOriginal<typeof import('ethers')>();
  return {
    ...ref,
    JsonRpcProvider: vi.fn().mockImplementation((url: string) => {
      return {};
    }),
  };
});

describe('EvmRpcObservationExtractor', () => {
  let dataSource: DataSource;
  let extractor: TestEvmRpcObservationExtractor;

  beforeEach(async () => {
    dataSource = await createDatabase();
    extractor = new TestEvmRpcObservationExtractor(
      dataSource,
      {
        idKeys: {},
        tokens: [],
      },
      {
        get: vi.fn(),
      } as any
    );
  });

  describe('processTransactions', () => {
    /**
     * @target EvmRpcObservationExtractor.processTransactions
     * should return true and insert observation into database on valid lock tx
     * @dependencies
     * @scenario
     * - mock rosen-extractor to return rosen data
     * - mock `wait` function of the transaction to return tx object
     * - run test
     * - check returned value
     * - check database
     * @expected
     * - it should return true
     * - observation should be inserted into database
     */
    it('should return true and insert observation into database on valid lock tx', async () => {
      vi.spyOn(extractor.getRosenExtractor(), 'get').mockReturnValue(rosenData);

      vi.spyOn(txRes, 'wait').mockReturnValue(tx as any);

      // run test
      const res = await extractor.processTransactions(
        [txRes],
        generateBlockEntity(dataSource, 'block-id')
      );

      // check returned valid
      expect(res).toEqual(true);

      // check database
      const repository = dataSource.getRepository(ObservationEntity);
      const [rows, rowsCount] = await repository.findAndCount();
      expect(rowsCount).toEqual(1);
      const observation1 = rows[0];
      const txHash = tx.hash!;
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
     * @target EvmRpcObservationExtractor.processTransactions
     * should return true but insert no tx when transaction is failed
     * @dependencies
     * @scenario
     * - mock rosen-extractor to return rosen data
     * - mock `wait` function of the transaction to throw CallException error
     * - run test
     * - check returned value
     * - check database
     * @expected
     * - it should return true
     * - no observation should be inserted into database
     */
    it('should return true but insert no tx when transaction is failed', async () => {
      vi.spyOn(extractor.getRosenExtractor(), 'get').mockReturnValue(rosenData);

      vi.spyOn(txRes, 'wait').mockImplementation((x: number | undefined) => {
        throw {
          code: 'CALL_EXCEPTION',
        };
      });

      // run test
      const res = await extractor.processTransactions(
        [txRes],
        generateBlockEntity(dataSource, 'block-id')
      );

      // check returned valid
      expect(res).toEqual(true);

      // check database
      const repository = dataSource.getRepository(ObservationEntity);
      const [rows, rowsCount] = await repository.findAndCount();
      expect(rowsCount).toEqual(0);
    }, 100000);

    /**
     * @target EvmRpcObservationExtractor.processTransactions
     * should return true with no observation in database on invalid lock tx
     * @dependencies
     * @scenario
     * - mock rosen-extractor to return undefined
     * - run test
     * - check returned value
     * - check database
     * @expected
     * - it should return true
     * - no observation should be into database
     */
    it('should return true with no observation in database on invalid lock tx', async () => {
      vi.spyOn(extractor.getRosenExtractor(), 'get').mockReturnValue(undefined);

      const res = await extractor.processTransactions(
        [txRes],
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
