import {
  CashAddressType,
  encodeCashAddress,
  encodeTransactionBCH,
  hashTransaction,
} from '@bitauth/libauth';
import { vi } from 'vitest';

import { encodeAddress } from '@rosen-bridge/address-codec';
import { BitcoinCashRpcTransaction } from '@rosen-bridge/bitcoin-cash-scanner';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { TokenMap } from '@rosen-bridge/tokens';

import { BitcoinCashRpcObservationExtractor } from '../lib';
import { receiver } from './bitcoinCashObservationTestData';

/** Deterministic native synthetic treasury address. */
const address = encodeCashAddress({
  prefix: 'bitcoincash',
  type: CashAddressType.p2pkh,
  payload: new Uint8Array(20).fill(1),
}).address;
/** Exact treasury locking script. */
const script = encodeAddress('bitcoin-cash', address);
/** Encoded public Ergo receiver. */
const receiverScript = encodeAddress('ergo', receiver);
/** Exact receiver and fee payload for the synthetic lock. */
const payload = `000000000000000123000000000000045621${receiverScript}`;
/** Canonical OP_RETURN containing the synthetic request. */
export const eventScript = `6a33${payload}`;
/** Deterministic source-input identifier. */
export const inputId = Uint8Array.from({ length: 32 }, (_, index) => index + 1);
/** Encodes a synthetic BCH lock with an optionally token-bearing treasury. */
export const fixture = (token = false): BitcoinCashRpcTransaction => {
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

/** Adapter with real extraction and an isolated observation-storage seam. */
export class TestBitcoinCashObservationExtractor extends BitcoinCashRpcObservationExtractor {
  stored = vi.fn().mockResolvedValue(true);
  /** Uses real native extraction while replacing observation storage. */
  constructor(tokens: TokenMap, storeRawData = true) {
    // The storage seam is mocked; native parsing, AddressManager and TokenMap are real.
    const dataSource = {
      getRepository: vi.fn().mockReturnValue({}),
    } as unknown as DataSource;
    super(address, dataSource, tokens, undefined, storeRawData);
    this.actions.storeObservations = this.stored;
  }
}
