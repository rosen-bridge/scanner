import { describe, vi, expect } from 'vitest';
import {
  RosenAmount,
  RosenChainToken,
  RosenTokens,
} from '@rosen-bridge/tokens';
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

describe('RunesAbstractObservationExtractor', () => {
  let extractor: RunesRpcObservationExtractor;
  let mockDataSource: any;
  let mockQueryRunner: any;
  let mockRepository: any;
  let mockTokenMap: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockRepository = {
      insert: vi.fn().mockResolvedValue({}),
      update: vi.fn().mockResolvedValue({}),
    };

    mockQueryRunner = {
      connect: vi.fn().mockResolvedValue(undefined),
      startTransaction: vi.fn().mockResolvedValue(undefined),
      commitTransaction: vi.fn().mockResolvedValue(undefined),
      rollbackTransaction: vi.fn().mockResolvedValue(undefined),
      release: vi.fn().mockResolvedValue(undefined),
      manager: {
        getRepository: vi.fn().mockResolvedValue(mockRepository),
      },
    };

    mockDataSource = {
      createQueryRunner: vi.fn().mockReturnValue(mockQueryRunner),
      getRepository: vi.fn().mockResolvedValue(mockRepository),
    };

    mockTokenMap = {
      search: (
        chain: string,
        condition: Partial<RosenChainToken>
      ): RosenTokens => {
        return [];
      },

      getID: (
        token: { [key: string]: RosenChainToken },
        chain: string
      ): string => {
        return '';
      },

      wrapAmount: (
        tokenId: string,
        amount: bigint,
        chain: string
      ): RosenAmount => {
        return {
          amount: amount,
          decimals: 2,
        };
      },
    };

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
      expect(tokensSearchSpy).toHaveBeenCalledWith('runes', {
        tokenId: 'TEST',
      });

      expect(tokensGetIdSpy).toHaveBeenCalledOnce();
      expect(tokensGetIdSpy).toHaveBeenCalledWith(wrappedRune, 'cardano');

      expect(storeObservationsSpy).toHaveBeenCalledOnce();
      expect(storeObservationsSpy).toHaveBeenCalledWith(
        [
          {
            fromChain: 'runes',
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
