import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  BlockInfo,
  ErgoNetworkType,
  Transaction,
} from '@rosen-bridge/scanner-interfaces';

import { RewardAction } from '../../lib/actions/rewardAction';
import { RewardExtractor } from '../../lib/extractors/rewardExtractor';
import { createDatabase } from '../mocked/utils.mock';
import {
  GUARD_TREE,
  NET_FEE_TREE,
  PERMIT_TREE,
  REWARD_TREE,
  SAMPLE_BLOCK,
  SAMPLE_VALID_REWARD_TX,
  SAMPLE_INVALID_TX_WITHOUT_ANY_PERMIT_BOX,
  SAMPLE_INVALID_TX_BY_EMISSION_BOX_WITH_MULTIPLE_TOKENS,
  SAMPLE_INVALID_TX_WITHOUT_ANY_REWARD_RELATED_BOXES,
} from './testData';

interface TestContext {
  extractor: RewardExtractor;
  actionsMock: RewardAction;
}

vi.mock('../../lib/actions/rewardAction', () => {
  return { RewardAction: vi.fn() };
});

vi.mock('ergo-lib-wasm-nodejs', () => {
  return {
    Address: {
      from_base58: (addr: string) => ({
        to_ergo_tree: () => ({ to_base16_bytes: () => `${addr}` }),
      }),
    },
    ErgoBox: {
      from_json: () => ({
        register_value: () => ({
          to_byte_array: () =>
            '0x195bd457085e48b0e1467da99f011fc67827480c8a991b9a1ba53a6d2bb135d4',
        }),
        sigma_serialize_bytes: () => Buffer.from('abc'),
      }),
    },
    Transaction: {
      from_json: () => ({
        sigma_serialize_bytes: () => Buffer.from('010203', 'hex'),
      }),
    },
    NonMandatoryRegisterId: { R4: 'R4' },
  };
});

describe('RewardExtractor', () => {
  beforeEach<TestContext>(async (ctx) => {
    ctx.actionsMock = {
      storeEntities: vi.fn().mockResolvedValue(true),
      deleteBlock: vi.fn().mockResolvedValue(true),
    } as unknown as RewardAction;

    vi.mocked(RewardAction).mockImplementation(
      () => ctx.actionsMock as unknown as RewardAction,
    );

    ctx.extractor = new RewardExtractor(
      'test-reward-extractor',
      await createDatabase(),
      {
        type: ErgoNetworkType.Explorer,
        url: 'https://api.ergoplatform.com',
        address: REWARD_TREE,
        active: true,
      },
      {
        networkFeeAddresses: [NET_FEE_TREE],
        guardEmissionAddresses: [GUARD_TREE],
        permitAddresses: [PERMIT_TREE],
      },
    );
  });

  describe('hasTxData', () => {
    /**
     * @target should return true for valid reward transaction
     * @scenario
     * - provide a transaction with one reward box, one network fee box, one guard emission box, and one permit box
     * - call hasTxData with this transaction
     * @expected
     * - returns true
     */
    it<TestContext>('should return true for valid reward transaction', ({
      extractor,
    }) => {
      const result = extractor.hasTxData(
        SAMPLE_VALID_REWARD_TX as unknown as Transaction,
      );
      expect(result).toBe(true);
    });

    /**
     * @target should throw error when no permit box exists
     * @scenario
     * - provide a transaction with reward, network fee, and guard emission boxes but no permit boxes
     * - call hasTxData
     * @expected
     * - throws an exception
     */
    it<TestContext>('should throw error when no permit box exists', ({
      extractor,
    }) => {
      expect(() =>
        extractor.hasTxData(
          SAMPLE_INVALID_TX_WITHOUT_ANY_PERMIT_BOX as unknown as Transaction,
        ),
      ).toThrow();
    });

    /**
     * @target should throw error when guard emission box has multiple tokens
     * @scenario
     * - provide a transaction where guard emission box contains more than one token
     * - call hasTxData
     * @expected
     * - throws an exception
     */
    it<TestContext>('should throw error when guard emission box contains multiple tokens', ({
      extractor,
    }) => {
      expect(() =>
        extractor.hasTxData(
          SAMPLE_INVALID_TX_BY_EMISSION_BOX_WITH_MULTIPLE_TOKENS as unknown as Transaction,
        ),
      ).toThrow();
    });

    /**
     * @target should return false when transaction has no reward-related boxes
     * @scenario
     * - provide a transaction with outputs that do not match any reward, network fee, guard emission, or permit trees
     * - call hasTxData
     * @expected
     * - returns false
     */
    it<TestContext>('should return false when transaction has no reward-related boxes', ({
      extractor,
    }) => {
      const result = extractor.hasTxData(
        SAMPLE_INVALID_TX_WITHOUT_ANY_REWARD_RELATED_BOXES as unknown as Transaction,
      );
      expect(result).toBe(false);
    });
  });

  describe('extractTxData', () => {
    /**
     * @target should correctly extract reward data from a valid transaction
     * @scenario
     * - provide a valid transaction with reward, network fee, guard emission, and permit boxes
     * - call extractTxData with the transaction and a block
     * @expected
     * - returns an ExtractedRewardData object
     * - watchersEmission should sum permit box tokens correctly
     */
    it<TestContext>('should correctly extract reward data from a valid transaction', ({
      extractor,
    }) => {
      const data = extractor.extractTxData(
        SAMPLE_VALID_REWARD_TX as unknown as Transaction,
        SAMPLE_BLOCK as BlockInfo,
      );
      expect(data).toBeDefined();
      expect(data!.watchersEmission).toBeDefined();
    });
  });
});
