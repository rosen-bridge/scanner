import { ObservationEntity } from '@rosen-bridge/abstract-observation-extractor';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { TokenMap } from '@rosen-bridge/tokens';

import { HandshakeRpcObservationExtractor } from '../lib/handshakeRpcObservationExtractor';
import {
  mockLockAddress,
  mockLockTx,
  mockAuctionTx,
  mockInvalidTx,
  expectedObservation,
  mockTokens,
} from './testData';
import { createDatabase, generateBlockEntity } from './utils.mock';

describe('HandshakeRpcObservationExtractor', () => {
  let dataSource: DataSource;
  let extractor: HandshakeRpcObservationExtractor;
  let tokenMap: TokenMap;

  beforeEach(async () => {
    dataSource = await createDatabase();
    tokenMap = new TokenMap();
    await tokenMap.updateConfigByJson(mockTokens);

    extractor = new HandshakeRpcObservationExtractor(
      mockLockAddress,
      dataSource,
      tokenMap,
      undefined,
    );
  });

  describe('processTransactions', () => {
    /**
     * @target HandshakeRpcObservationExtractor.processTransactions
     * should return true and insert observation into database on valid lock tx
     * @dependencies
     * @scenario
     * - mock a valid Handshake lock transaction with chunked Rosen data outputs
     * - run test
     * - check returned value
     * - check database
     * @expected
     * - it should return true
     * - observation should be inserted into database
     */
    it('should return true and insert observation into database on valid lock tx', async () => {
      // run test
      const res = await extractor.processTransactions(
        [mockLockTx, mockAuctionTx],
        generateBlockEntity(dataSource, 'block-hash'),
      );

      // check returned valid
      expect(res).toEqual(true);

      // check database
      const repository = dataSource.getRepository(ObservationEntity);
      const [rows, rowsCount] = await repository.findAndCount();
      expect(rowsCount).toEqual(1);
      const observation1 = rows[0];
      expect(observation1).toEqual(expectedObservation);
    }, 100000);

    /**
     * @target HandshakeRpcObservationExtractor.processTransactions
     * should return true with no observation when transaction has name auction covenant
     * @dependencies
     * @scenario
     * - mock a Handshake transaction with name auction covenant (type != 0)
     * - run test
     * - check returned value
     * - check database
     * @expected
     * - it should return true
     * - no observation should be inserted into database
     */
    it('should return true with no observation when transaction has name auction covenant', async () => {
      // run test
      const res = await extractor.processTransactions(
        [mockAuctionTx],
        generateBlockEntity(dataSource, 'block-hash'),
      );

      // check returned valid
      expect(res).toEqual(true);

      // check database
      const repository = dataSource.getRepository(ObservationEntity);
      const [, rowsCount] = await repository.findAndCount();
      expect(rowsCount).toEqual(0);
    }, 100000);

    /**
     * @target HandshakeRpcObservationExtractor.processTransactions
     * should return true with no observation on invalid lock tx (missing lock output)
     * @dependencies
     * @scenario
     * - mock a transaction without lock output to the lock address
     * - run test
     * - check returned value
     * - check database
     * @expected
     * - it should return true
     * - no observation should be into database
     */
    it('should return true with no observation on invalid lock tx (missing lock output)', async () => {
      // run test
      const res = await extractor.processTransactions(
        [mockInvalidTx],
        generateBlockEntity(dataSource, 'block-hash'),
      );

      // check returned valid
      expect(res).toEqual(true);

      // check database
      const repository = dataSource.getRepository(ObservationEntity);
      const [, rowsCount] = await repository.findAndCount();
      expect(rowsCount).toEqual(0);
    }, 100000);

    /**
     * @target HandshakeRpcObservationExtractor.processTransactions
     * should process multiple transactions and only insert valid ones
     * @dependencies
     * @scenario
     * - mock multiple transactions (one valid, one auction, one invalid)
     * - run test
     * - check returned value
     * - check database
     * @expected
     * - it should return true
     * - only one observation should be inserted (the valid one)
     */
    it('should process multiple transactions and only insert valid ones', async () => {
      // run test
      const res = await extractor.processTransactions(
        [mockLockTx, mockAuctionTx, mockInvalidTx],
        generateBlockEntity(dataSource, 'block-hash'),
      );

      // check returned valid
      expect(res).toEqual(true);

      // check database
      const repository = dataSource.getRepository(ObservationEntity);
      const [rows, rowsCount] = await repository.findAndCount();
      expect(rowsCount).toEqual(1);
      expect(rows[0].sourceTxId).toEqual(mockLockTx.txid);
    }, 100000);
  });

  describe('getId', () => {
    /**
     * @target HandshakeRpcObservationExtractor.getId
     * should return the correct extractor ID
     * @dependencies
     * @scenario
     * - call getId
     * @expected
     * - it should return 'handshake-rpc-extractor'
     */
    it('should return the correct extractor ID', () => {
      const id = extractor.getId();
      expect(id).toEqual('handshake-rpc-extractor');
    });
  });

  describe('getTxId', () => {
    /**
     * @target HandshakeRpcObservationExtractor.getTxId
     * should return the transaction ID from a HandshakeRpcTransaction
     * @dependencies
     * @scenario
     * - call getTxId with a mock transaction
     * @expected
     * - it should return the txid field
     */
    it('should return the transaction ID from a HandshakeRpcTransaction', () => {
      const txId = extractor.getTxId(mockLockTx);
      expect(txId).toEqual(mockLockTx.txid);
    });
  });
});
