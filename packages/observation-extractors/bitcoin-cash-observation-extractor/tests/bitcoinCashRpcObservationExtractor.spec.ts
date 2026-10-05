import { blake2b } from 'blakejs';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { chainValidators, chainDecoders } from '@rosen-bridge/address-codec';
import { AddressManager } from '@rosen-bridge/address-manager';
import { BitcoinCashRpcTransaction } from '@rosen-bridge/bitcoin-cash-scanner';
import { TokenMap } from '@rosen-bridge/tokens';

import { receiver } from './bitcoinCashObservationTestData';
import {
  eventScript,
  inputId,
  fixture,
  TestBitcoinCashObservationExtractor,
} from './bitcoinCashObservationTestUtils';

describe('BitcoinCashRpcObservationExtractor', () => {
  let tokens: TokenMap;

  const block = { hash: 'aa'.repeat(32), height: 4 };

  beforeAll(() => {
    AddressManager.init(chainValidators, chainDecoders);
  });

  beforeEach(async () => {
    tokens = new TokenMap();
    await tokens.updateConfigByJson([
      {
        'bitcoin-cash': {
          tokenId: 'bch',
          name: 'BCH',
          decimals: 8,
          type: 'native',
          residency: 'native',
          extra: {},
        },
        ergo: {
          tokenId: 'bb'.repeat(32),
          name: 'rsBCH',
          decimals: 6,
          type: 'wrapped',
          residency: 'wrapped',
          extra: {},
        },
      },
    ]);
  });
  describe('getId', () => {
    /**
     * @target BitcoinCashRpcObservationExtractor.getId returns its persistent extractor ID
     * @dependencies Actual adapter and native transaction fixture with mocked storage
     * @scenario Read the adapter identity
     * @expected Preserve the original exact identity assertion
     */
    it('returns its persistent extractor ID', () => {
      const adapter = new TestBitcoinCashObservationExtractor(tokens);
      expect(adapter.getId()).toEqual('bitcoin-cash-rpc-extractor');
    });
  });
  describe('getTxId', () => {
    /**
     * @target BitcoinCashRpcObservationExtractor.getTxId returns the canonical transaction ID
     * @dependencies Actual adapter and native transaction fixture with mocked storage
     * @scenario Read the canonical transaction identifier
     * @expected Preserve the original exact identity assertion
     */
    it('returns the canonical transaction ID', () => {
      const adapter = new TestBitcoinCashObservationExtractor(tokens);
      const tx = fixture();
      expect(adapter.getTxId(tx)).toEqual(tx.txid);
    });
    /**
     * @target BitcoinCashRpcObservationExtractor.getTxId normalizes the uppercase transaction ID
     * @dependencies Actual adapter and native transaction fixture with mocked storage
     * @scenario Read the uppercase transaction identifier
     * @expected Preserve the original exact identity assertion
     */
    it('normalizes the uppercase transaction ID', () => {
      const adapter = new TestBitcoinCashObservationExtractor(tokens);
      const tx = fixture();
      expect(adapter.getTxId({ ...tx, txid: tx.txid.toUpperCase() })).toEqual(
        tx.txid,
      );
    });
  });
  describe('processTransactions', () => {
    /**
     * @target BitcoinCashRpcObservationExtractor.processTransactions joins inherited observation processing with actual native extraction and TokenMap
     * @dependencies
     * - Real parsing, codecs and TokenMap with mocked observation storage
     * @scenario
     * - Process a native BCH-to-Ergo lock transaction through inherited persistence
     * @expected
     * - Exact transformed amount, source fees, receiver and request ID persist
     */
    it('joins inherited observation processing with actual native extraction and TokenMap', async () => {
      const adapter = new TestBitcoinCashObservationExtractor(tokens);
      const tx = fixture();
      expect(await adapter.processTransactions([tx], block)).toEqual(true);
      expect(adapter.stored).toHaveBeenCalledWith(
        [
          {
            fromChain: 'bitcoin-cash',
            toChain: 'ergo',
            amount: '1234568',
            sourceChainTokenId: 'bch',
            targetChainTokenId: 'bb'.repeat(32),
            sourceTxId: tx.txid,
            bridgeFee: '291',
            networkFee: '1110',
            sourceBlockId: block.hash,
            requestId: Buffer.from(blake2b(tx.txid, undefined, 32)).toString(
              'hex',
            ),
            toAddress: receiver,
            fromAddress: `box:${Buffer.from(inputId).toString('hex')}.7`,
            rawData: eventScript,
          },
        ],
        block,
        'bitcoin-cash-rpc-extractor',
      );
    });

    /**
     * @target BitcoinCashRpcObservationExtractor.processTransactions preserves configured raw-data suppression
     * @dependencies
     * - Real parsing, codecs and TokenMap with mocked observation storage
     * @scenario
     * - Disable raw data and process a valid native transaction
     * @expected
     * - The stored observation contains the inherited suppression message
     */
    it('preserves configured raw-data suppression', async () => {
      const adapter = new TestBitcoinCashObservationExtractor(tokens, false);
      await adapter.processTransactions([fixture()], block);
      expect(adapter.stored.mock.calls[0][0][0].rawData).toEqual(
        'raw-data extraction is off',
      );
    });

    /**
     * @target BitcoinCashRpcObservationExtractor.processTransactions stores no observation for %s
     * @dependencies
     * - Real parsing, codecs and TokenMap with mocked observation storage
     * @scenario
     * - Change raw identity, treasury token metadata, amount or raw-byte presence
     * @expected
     * - Every isolated mutation persists an empty observation list
     */
    it.each([
      [
        'raw identity mismatch',
        (tx: BitcoinCashRpcTransaction) => {
          tx.txid = 'cc'.repeat(32);
        },
      ],
      [
        'token-bearing treasury metadata',
        (tx: BitcoinCashRpcTransaction) => {
          tx.vout[0].tokenData = { category: 'cc'.repeat(32), amount: '1' };
        },
      ],
      [
        'value mismatch',
        (tx: BitcoinCashRpcTransaction) => {
          tx.vout[0].value = '1.23456790';
        },
      ],
      [
        'missing raw bytes',
        (tx: BitcoinCashRpcTransaction) => {
          tx.hex = '';
        },
      ],
    ])('stores no observation for %s', async (_name, mutate) => {
      const adapter = new TestBitcoinCashObservationExtractor(tokens);
      const tx = fixture();
      mutate(tx);
      await adapter.processTransactions([tx], block);
      expect(adapter.stored).toHaveBeenCalledWith(
        [],
        block,
        'bitcoin-cash-rpc-extractor',
      );
    });

    /**
     * @target BitcoinCashRpcObservationExtractor.processTransactions stores no observation for unknown native token map
     * @dependencies
     * - Real parsing, codecs and TokenMap with mocked observation storage
     * @scenario
     * - Process a valid native transaction through an empty TokenMap
     * @expected
     * - An empty observation list is persisted
     */
    it('stores no observation for unknown native token map', async () => {
      const adapter = new TestBitcoinCashObservationExtractor(new TokenMap());
      await adapter.processTransactions([fixture()], block);
      expect(adapter.stored).toHaveBeenCalledWith(
        [],
        block,
        'bitcoin-cash-rpc-extractor',
      );
    });

    /**
     * @target BitcoinCashRpcObservationExtractor.processTransactions excludes token-bearing treasury raw bytes when RPC omits token metadata
     * @dependencies
     * - Real parsing, codecs and TokenMap with mocked observation storage
     * @scenario
     * - Process token-bearing treasury bytes with omitted RPC token metadata
     * @expected
     * - An empty observation list is persisted
     */
    it('excludes token-bearing treasury raw bytes when RPC omits token metadata', async () => {
      const adapter = new TestBitcoinCashObservationExtractor(tokens);
      await adapter.processTransactions([fixture(true)], block);
      expect(adapter.stored).toHaveBeenCalledWith(
        [],
        block,
        'bitcoin-cash-rpc-extractor',
      );
    });
  });
});
