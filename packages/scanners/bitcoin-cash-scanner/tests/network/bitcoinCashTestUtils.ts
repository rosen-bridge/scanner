import {
  encodeTransactionBCH,
  hashTransaction,
  Output,
} from '@bitauth/libauth';

import { BitcoinCashRpcTransaction } from '../../lib';

/** Fixed synthetic containing-block identifier. */
export const blockHash = 'aa'.repeat(32);
/** Fixed synthetic predecessor-block identifier. */
export const parentHash = 'bb'.repeat(32);
/** Deterministic synthetic funding-input identifier. */
export const sourceId = Uint8Array.from(
  { length: 32 },
  (_, index) => index + 1,
);
/** Encodes a synthetic raw BCH transaction with matching RPC metadata. */
export const fixture = (
  token = false,
  nft = false,
  unlockingBytes = 1,
  sequenceNumber = 0xffffffff,
): BitcoinCashRpcTransaction => {
  const output: Output = {
    lockingBytecode: Uint8Array.of(0x51),
    valueSatoshis: 1n,
    token: token
      ? {
          amount: 5n,
          category: new Uint8Array(32).fill(2),
          nft: nft
            ? { capability: 'mutable', commitment: Uint8Array.of(1) }
            : undefined,
        }
      : undefined,
  };
  const bytes = encodeTransactionBCH({
    version: 2,
    locktime: 0,
    inputs: [
      {
        outpointTransactionHash: sourceId,
        outpointIndex: 7,
        sequenceNumber,
        unlockingBytecode: new Uint8Array(unlockingBytes).fill(0x51),
      },
    ],
    outputs: [output],
  });
  return {
    hex: Buffer.from(bytes).toString('hex'),
    txid: hashTransaction(bytes),
    blockhash: blockHash,
    vin: [{ txid: Buffer.from(sourceId).toString('hex'), vout: 7 }],
    vout: [
      {
        n: 0,
        value: 1e-8,
        scriptPubKey: { hex: '51' },
        tokenData: token
          ? {
              category: '02'.repeat(32),
              amount: '5',
              nft: nft
                ? { capability: 'mutable', commitment: '01' }
                : undefined,
            }
          : undefined,
      },
    ],
  };
};
