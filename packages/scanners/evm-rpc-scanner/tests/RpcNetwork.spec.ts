import { Transaction } from 'ethers';
import * as testData from './testData';
import { TestEvmRpcNetwork } from './TestRpcNetwork';
import {
  mockGetBlockNumber,
  mockGetBlock,
  resetRpcMock,
} from './mocked/JsonRpcProvider.mock';
import { BlockNotFound } from '../lib/types';

describe('RPCNetwork', () => {
  let network: TestEvmRpcNetwork;

  beforeEach(() => {
    resetRpcMock();
    network = new TestEvmRpcNetwork('', 1);
  });

  describe('getCurrentHeight', () => {
    /**
     * @target `RPCNetwork.getHeight` should return block height successfully
     * @dependencies
     * @scenario
     * - mock `RPC.getBlockNumber`
     * - run test
     * - check returned value
     * @expected
     * - it should be mocked block height
     */
    it('should return block height successfully', async () => {
      // mock client response
      mockGetBlockNumber(network.getProvider());

      // run test
      const result = await network.getCurrentHeight();

      // check returned value
      expect(result).toEqual(testData.blockHeight);
    });
  });

  describe('getBlockTxs', () => {
    /**
     * @target `RPCNetwork.getBlockTxs` should return
     * transactions of the block
     * @dependencies
     * @scenario
     * - mock `RPC.getBlock` with prefetchTxs `true`
     * - run test
     * - check returned value
     * @expected
     * - it should return transactions of the block
     */
    it('should return transactions of the block', async () => {
      // mock client response
      mockGetBlock(network.getProvider(), testData.blockInfo);

      // run test
      const result = await network.getBlockTxs(testData.blockHash);

      // check returned value
      for (let i = 0; i < result.length; i++) {
        const trx = Transaction.from(result[i]);
        expect(trx.toJSON()).toEqual(testData.convertedTxList[i]);
      }
    });

    /**
     * @target `RPCNetwork.getBlockTxs` should throw
     * error if block can not be found.
     * @dependencies
     * @scenario
     * - mock `RPC.getBlock` with prefetchTxs `true`
     * - run test
     * - call the function and expect error
     * @expected
     * - getBlockTxs should throw BlockNotFound
     */
    it('should throw BlockNotFound', async () => {
      // mock client response
      mockGetBlock(network.getProvider(), null);

      // run test
      const result = network.getBlockTxs(testData.blockHash);

      // check returned value
      expect(result).rejects.toThrowError(BlockNotFound);
    });
  });

  describe('getBlockAtHeight', () => {
    /**
     * @target `RPCNetwork.getBlockInfo` should return block info
     * @dependencies
     * @scenario
     * - mock `RPC.getBlock`
     * - run test
     * - check returned value
     * @expected
     * - it should return block info successfully
     */
    it('should return block info successfully', async () => {
      // mock client response
      mockGetBlock(network.getProvider(), testData.blockInfo);

      // run test
      const result = await network.getBlockAtHeight(testData.blockHeight);

      // check returned value
      expect(result).toEqual({
        hash: testData.blockInfo.hash,
        blockHeight: testData.blockInfo.number,
        parentHash: testData.blockInfo.parentHash,
        timestamp: testData.blockInfo.timestamp,
        txCount: testData.blockInfo.length,
      });
    });

    /**
     * @target `RPCNetwork.getBlockAtHeight` should throw
     * error when block height is wrong
     * @dependencies
     * @scenario
     * - mock `RPC.getBlock`
     * - run test
     * - call the function and expect error
     * @expected
     * - getBlockAtHeight should throw BlockNotFound
     */
    it('should throw error when block height is wrong', async () => {
      // mock client response
      mockGetBlock(network.getProvider(), null);

      // run test
      const result = network.getBlockAtHeight(testData.wrongBlockHeight);

      // check returned value
      expect(result).rejects.toThrow(BlockNotFound);
    });
  });
});
