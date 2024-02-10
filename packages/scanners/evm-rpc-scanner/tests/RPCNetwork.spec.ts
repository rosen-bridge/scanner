import * as testData from './testData';
import { TestEVMRPCNetwork } from './TestRPCNetwork';
import {
  mockGetBlockNumber,
  mockTxs,
  mockGetBlock,
  mockGetBlockThrowError,
  mockTxsThrowError,
} from './mocked/JsonRPC.mock';
import { BlockNotFound } from '../lib/types';
import { resetRPCMock } from './mocked/RPC.mock';

describe('RPCNetwork', () => {
  let network: TestEVMRPCNetwork;

  beforeEach(() => {
    resetRPCMock();
    network = new TestEVMRPCNetwork('', 1);
  });

  //   describe('constructor', () => {
  //     /**
  //      * @target constructor of `CardanoBlockFrostNetwork` should set extractor
  //      * @dependencies
  //      * @scenario
  //      * - construct an `CardanoBlockFrostNetwork`
  //      * @expected
  //      * - extractor of network should be defined
  //      */
  //     it('should set extractor', () => {
  //       const network = mockNetwork();

  //       expect(network.).toBeDefined();
  //     });
  //   });

  describe('getCurrentHeight', () => {
    //     /**
    //      * @target `RPCNetwork.getHeight` should return block height successfully
    //      * @dependencies
    //      * @scenario
    //      * - mock `RPC.getBlockNumber`
    //      * - run test
    //      * - check returned value
    //      * @expected
    //      * - it should be mocked block height
    //      */
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
     * id of block transactions
     * @dependencies
     * @scenario
     * - mock `RPC.getBlock` with prefetchTxs `true`
     * - run test
     * - check returned value
     * @expected
     * - it should be mocked transactions
     */
    it('should return transactions of the block', async () => {
      // mock client response
      mockTxs(network.getProvider());

      // run test
      const result = await network.getBlockTxs(testData.blockHash);

      // check returned value
      expect(result).toEqual(testData.transactionsList);
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
    it('should return transactions of the block', async () => {
      // mock client response
      mockTxsThrowError(network.getProvider());

      // run test
      const result = network.getBlockTxs(testData.blockHash);

      // check returned value
      expect(result).rejects.toThrowError(BlockNotFound);
    });
  });

  describe('getBlockAtHeight', () => {
    /**
     * @target `RPCNetwork.getBlockInfo` should return
     * block hash, parent hash and height
     * @dependencies
     * @scenario
     * - mock `RPC.getBlock`
     * - run test
     * - check returned value
     * @expected
     * - it should be mocked block info
     */
    it('should return block hash, parent hash and height', async () => {
      // mock client response
      mockGetBlock(network.getProvider());

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
     * error. The block shouldn't be found
     * @dependencies
     * @scenario
     * - mock `RPC.getBlock`
     * - run test
     * - call the function and expect error
     * @expected
     * - getBlockAtHeight should throw NotEnoughAssetsError
     */
    it('should throw error when block height is wrong', async () => {
      // mock client response
      mockGetBlockThrowError(network.getProvider());

      // run test
      const result = network.getBlockAtHeight(testData.wrongBlockHeight);

      // check returned value
      expect(result).rejects.toThrow(BlockNotFound);
    });
  });
});
