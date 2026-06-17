import { vi } from 'vitest';

import { FiroElectrumXNetwork } from '../../lib/network/firoElectrumXNetwork';
import {
  blockHeader,
  blockHeight,
  testTx,
  testTxV3,
} from '../firoElectrumxTestData';
import {
  mockedSocket,
  mockSocketError,
  mockSocketResult,
  resetSocketMock,
} from '../mocked/electrumxSocket.mock';

vi.mock('tls', () => ({
  connect: vi.fn(() => mockedSocket),
}));

describe('FiroElectrumXNetwork', () => {
  let network: FiroElectrumXNetwork;

  beforeEach(async () => {
    resetSocketMock();
    mockSocketResult('server.version', ['FiroElectrumXSocket', '1.4']);
    network = new FiroElectrumXNetwork('address', 50002);
    network.setupSocket();
  });

  describe('getCurrentHeight', () => {
    /**
     * @target FiroElectrumXNetwork.getCurrentHeight should return the height successfully
     * @dependencies
     * - mock blockchain.headers.subscribe
     * - run test
     * - check returned value
     * @expected
     * - should return the mocked height number
     */
    it('should return the current height successfully', async () => {
      mockSocketResult('blockchain.headers.subscribe', {
        hex: blockHeader.hex,
        height: blockHeight,
      });

      const height = await network.getCurrentHeight();
      expect(height).toBe(blockHeight);
    });
  });

  describe('getBlockAtHeight', () => {
    /**
     * @target FiroElectrumXNetwork.getBlockAtHeight should parse the block successfully
     * from blockchain.block.header
     * @dependencies
     * - mock blockchain.block.header
     * - run test
     * - check returned value
     * @expected
     * - should parse the 80-byte header and return hash, parentHash, height, timestamp
     */
    it('should parse the block successfully', async () => {
      mockSocketResult('blockchain.block.header', blockHeader.hex);

      const block = await network.getBlockAtHeight(blockHeight);

      expect(block.hash).toBe(blockHeader.hash);
      expect(block.parentHash).toBe(blockHeader.parentHash);
      expect(block.height).toBe(blockHeight);
      expect(block.timestamp).toBe(1716163200);
    });
  });

  describe('getBlockTxs', () => {
    /**
     * @target FiroElectrumXNetwork.getBlockTxs should get and parse block transactions successfully
     * from blockchain.block.txids + blockchain.transaction.get
     * @dependencies
     * - mock blockchain.block.txids to return 2 transactions (v2 and v3)
     * - mock blockchain.transaction.get to return mocked transactions
     * @expected
     * - should parse the transactions into FiroRpcTransaction with correct vin/vout
     */
    it('should get and parse block transactions successfully', async () => {
      mockSocketResult('blockchain.block.txids', [testTx.txid, testTxV3.txid]);
      mockSocketResult('blockchain.transaction.get', testTx.hex);
      mockSocketResult('blockchain.transaction.get', testTxV3.hex);

      const txs = await network.getBlockTxs(blockHeader.hash, blockHeight);

      expect(txs).toHaveLength(2);
      // verify 1st transaction
      const tx = txs[0];
      expect(tx.txid).toBe(testTx.txid);
      expect(tx.hash).toBe(testTx.txid);
      expect(tx.version).toBe(2);
      expect(tx.locktime).toBe(0);
      expect(tx.vin).toHaveLength(1);
      expect(tx.vin[0].txid).toBe(testTx.expectedVin[0].txid);
      expect(tx.vin[0].vout).toBe(testTx.expectedVin[0].vout);
      expect(tx.vout).toHaveLength(1);
      expect(tx.vout[0].value).toBe(testTx.expectedVout[0].value);
      expect(tx.vout[0].n).toBe(testTx.expectedVout[0].n);
      expect(tx.vout[0].scriptPubKey.hex).toBe(
        testTx.expectedVout[0].scriptHex,
      );
      // verify 2nd transaction
      const txV3 = txs[1];
      expect(txV3.txid).toBe(testTxV3.txid);
      expect(txV3.hash).toBe(testTxV3.txid);
      expect(txV3.version).toBe(3);
      expect(txV3.locktime).toBe(0);
      expect(txV3.vin).toHaveLength(1);
      expect(txV3.vin[0].txid).toBe(testTxV3.expectedVin[0].txid);
      expect(txV3.vin[0].vout).toBe(testTxV3.expectedVin[0].vout);
      expect(txV3.vout).toHaveLength(2);
      expect(txV3.vout[0].value).toBe(testTxV3.expectedVout[0].value);
      expect(txV3.vout[0].n).toBe(testTxV3.expectedVout[0].n);
      expect(txV3.vout[0].scriptPubKey.hex).toBe(
        testTxV3.expectedVout[0].scriptHex,
      );
      expect(txV3.vout[1].value).toBe(testTxV3.expectedVout[1].value);
      expect(txV3.vout[1].n).toBe(testTxV3.expectedVout[1].n);
      expect(txV3.vout[1].scriptPubKey.hex).toBe(
        testTxV3.expectedVout[1].scriptHex,
      );
    });

    /**
     * @target FiroElectrumXNetwork.getBlockTxs should throw error when all transactions are not fetched
     * @dependencies
     * - mock blockchain.block.txids to return 2 transactions
     * - mock blockchain.transaction.get to return one transaction and throw error for the other one
     * - run test & check thrown exception
     * @expected
     * - should be rejected with the mocked error
     */
    it('should throw error when all transactions are not fetched', async () => {
      const badTxid =
        'badbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadb';
      mockSocketResult('blockchain.block.txids', [badTxid, testTx.txid]);
      // First transaction.get errors, second one would succeed (but is never reached).
      mockSocketError('blockchain.transaction.get', {
        code: -1,
        message: 'Mocked Error',
      });
      mockSocketResult('blockchain.transaction.get', testTx.hex);

      await expect(
        network.getBlockTxs(blockHeader.hash, blockHeight),
      ).rejects.toThrow('Mocked Error');
    });
  });
});
