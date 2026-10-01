import {
  CashAddressType,
  encodeCashAddress,
  encodeTransactionBCH,
  hashTransaction,
} from '@bitauth/libauth';
import { blake2b } from 'blakejs';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  chainValidators,
  chainDecoders,
  encodeAddress,
} from '@rosen-bridge/address-codec';
import { AddressManager } from '@rosen-bridge/address-manager';
import { BitcoinCashRpcTransaction } from '@rosen-bridge/bitcoin-scanner';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { TokenMap } from '@rosen-bridge/tokens';

import { BitcoinCashRpcObservationExtractor } from '../lib';

const address = encodeCashAddress({
  prefix: 'bitcoincash',
  type: CashAddressType.p2pkh,
  payload: new Uint8Array(20).fill(1),
}).address;
const script = encodeAddress('bitcoin-cash', address);
const receiver = '9iMjQx8PzwBKXRvsFUJFJAPoy31znfEeBUGz8DRkcnJX4rJYjVd';
const receiverScript = encodeAddress('ergo', receiver);
const payload = `000000000000000123000000000000045621${receiverScript}`;
const eventScript = `6a33${payload}`;
const inputId = Uint8Array.from({ length: 32 }, (_, index) => index + 1);
const fixture = (token = false): BitcoinCashRpcTransaction => {
  const bytes = encodeTransactionBCH({
    version: 2,
    locktime: 0,
    inputs: [
      {
        outpointTransactionHash: inputId,
        outpointIndex: 7,
        sequenceNumber: 0xffffffff,
        unlockingBytecode: Uint8Array.of(0x51),
      },
    ],
    outputs: [
      {
        valueSatoshis: 123456789n,
        lockingBytecode: Uint8Array.from(Buffer.from(script, 'hex')),
        token: token
          ? { amount: 1n, category: new Uint8Array(32).fill(2) }
          : undefined,
      },
      {
        valueSatoshis: 0n,
        lockingBytecode: Uint8Array.from(Buffer.from(eventScript, 'hex')),
      },
    ],
  });
  return {
    hex: Buffer.from(bytes).toString('hex'),
    txid: hashTransaction(bytes),
    vin: [{ txid: Buffer.from(inputId).toString('hex'), vout: 7 }],
    vout: [
      { n: 0, value: '1.23456789', scriptPubKey: { hex: script } },
      { n: 1, value: '0', scriptPubKey: { hex: eventScript } },
    ],
  };
};

class TestBitcoinCashObservationExtractor extends BitcoinCashRpcObservationExtractor {
  stored = vi.fn().mockResolvedValue(true);
  constructor(tokens: TokenMap, storeRawData = true) {
    // The storage seam is mocked; native parsing, AddressManager and TokenMap are real.
    const dataSource = {
      getRepository: vi.fn().mockReturnValue({}),
    } as unknown as DataSource;
    super(address, dataSource, tokens, undefined, storeRawData);
    this.actions.storeObservations = this.stored;
  }
}

describe('native BCH observation adapter', () => {
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
  it('joins inherited observation processing with actual native extraction and TokenMap', async () => {
    const adapter = new TestBitcoinCashObservationExtractor(tokens);
    const tx = fixture();
    expect(adapter.getId()).toBe('bitcoin-cash-rpc-extractor');
    expect(adapter.getTxId(tx)).toBe(tx.txid);
    expect(adapter.getTxId({ ...tx, txid: tx.txid.toUpperCase() })).toBe(
      tx.txid,
    );
    expect(await adapter.processTransactions([tx], block)).toBe(true);
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
  it('preserves configured raw-data suppression', async () => {
    const adapter = new TestBitcoinCashObservationExtractor(tokens, false);
    await adapter.processTransactions([fixture()], block);
    expect(adapter.stored.mock.calls[0][0][0].rawData).toBe(
      'raw-data extraction is off',
    );
  });
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
  it('stores no observation for unknown native token map', async () => {
    const adapter = new TestBitcoinCashObservationExtractor(new TokenMap());
    await adapter.processTransactions([fixture()], block);
    expect(adapter.stored).toHaveBeenCalledWith(
      [],
      block,
      'bitcoin-cash-rpc-extractor',
    );
  });
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
