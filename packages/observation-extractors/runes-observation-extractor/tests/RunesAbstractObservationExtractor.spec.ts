import { describe, vi, expect } from 'vitest';
import { TokenMap } from '@rosen-bridge/tokens';
import { BitcoinRpcTransaction } from '@rosen-bridge/bitcoin-rpc-scanner';
import { Block } from '@rosen-bridge/scanner-interfaces';
import {
  mockLockAddress,
  mockOrdiscanApiKey,
  mockOrdiscanRunesTransfer,
  mockOrdiscanUrl,
  rosenData,
  txs,
} from './testData';
import { RunesRpcObservationExtractor } from '../lib';
import { createDatabase } from './testUtils';
import { DataSource } from 'typeorm';

describe('RunesAbstractObservationExtractor', () => {
  let extractor: RunesRpcObservationExtractor;
  let mockDataSource: DataSource;
  let mockTokenMap: TokenMap;

  beforeEach(async () => {
    vi.clearAllMocks();

    mockDataSource = await createDatabase();
    mockTokenMap = new TokenMap();

    extractor = new RunesRpcObservationExtractor(
      mockLockAddress,
      mockOrdiscanUrl,
      mockOrdiscanApiKey,
      mockDataSource,
      mockTokenMap,
      undefined
    );
  });

  describe('processTransactions', () => {
    /**
     * @target RunesAbstractObservationExtractor.processTransactions should process transactions successfully
     * @dependencies
     * @scenario
     * - stub getTxRunesTransfer to resolve to a mock transfer
     * - stub tokens.search to return a mock value
     * - stub tokens.getID to return a mock token id
     * - stub actions.storeObservations to resolve to true
     * - define a mock array containing 1 transaction
     * - define a mock block object
     * - call processTransactions using the mock txs and block
     * @expected
     * - getTxRunesTransfer should have been called once with txId
     * - tokens.search should have been called with tokenId for each txRunesTransfer output
     * - tokens.getID should have been called with token and chain for each txRunesTransfer output
     * - actions.storeObservations should have been called once with observations, block, and chain id
     * - processTransactions should have returned true
     */
    it('should process transactions successfully', async () => {
      // arrange
      const wrappedRune = {
        cardano: {
          tokenId: 'tokenId',
          name: 'name',
          decimals: 3,
          type: 'type',
          residency: 'residency',
          extra: {},
        },
      };

      const getTxRunesTransferSpy = vi
        .spyOn(extractor, 'getTxRunesTransfer')
        .mockResolvedValue(mockOrdiscanRunesTransfer);

      const tokensSearchSpy = vi
        .spyOn(extractor['tokens'], 'search')
        .mockReturnValue([wrappedRune]);

      const tokensGetIdSpy = vi
        .spyOn(extractor['tokens'], 'getID')
        .mockReturnValue('tokenId');

      const storeObservationsSpy = vi
        .spyOn(extractor['actions'], 'storeObservations')
        .mockResolvedValue(true);

      const mockTxs: BitcoinRpcTransaction[] = [txs.lockTx];
      const mockBlock: Block = {
        parentHash: 'parentHash',
        hash: 'hash',
        height: 0,
        timestamp: 0,
        extra: undefined,
        txCount: undefined,
      };

      // act
      const result = await extractor.processTransactions(mockTxs, mockBlock);

      // assert
      expect(getTxRunesTransferSpy).toHaveBeenCalledOnce();
      expect(getTxRunesTransferSpy).toHaveBeenCalledWith(txs.lockTx.txid);

      expect(tokensSearchSpy).toHaveBeenCalledOnce();
      expect(tokensSearchSpy).toHaveBeenCalledWith('bitcoin-runes', {
        tokenId: 'TEST',
      });

      expect(tokensGetIdSpy).toHaveBeenCalledOnce();
      expect(tokensGetIdSpy).toHaveBeenCalledWith(wrappedRune, 'cardano');

      expect(storeObservationsSpy).toHaveBeenCalledOnce();
      expect(storeObservationsSpy).toHaveBeenCalledWith(
        [
          {
            fromChain: 'bitcoin-runes',
            toChain: rosenData.toChain,
            amount: '1200',
            sourceChainTokenId: 'TEST',
            targetChainTokenId: 'tokenId',
            sourceTxId: rosenData.sourceTxId,
            bridgeFee: rosenData.bridgeFee,
            networkFee: rosenData.networkFee,
            sourceBlockId: 'hash',
            requestId: expect.any(String),
            toAddress: rosenData.toAddress,
            fromAddress: rosenData.fromAddress,
          },
        ],
        mockBlock,
        'runes-rpc-extractor'
      );

      expect(result).toBe(true);
    });
  });
});
