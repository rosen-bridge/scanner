import {
  decodeTransactionBCH,
  encodeTransactionBCH,
  hashTransaction,
  Output,
  TransactionCommon,
} from '@bitauth/libauth';

import { BitcoinCashRpcTransaction } from '../bitcoinCashTypes';

// Local work limits, independent of BCH consensus limits.
export const BITCOIN_CASH_RPC_LIMITS = Object.freeze({
  transactionBytes: 1_000_000,
  transactionIO: 4096,
  blockTransactions: 10000,
  blockTransactionBytes: 32_000_000,
  responseBytes: 64_000_000,
});

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
export const isHash = (value: unknown): value is string =>
  typeof value === 'string' && /^[0-9a-f]{64}$/.test(value);
export const isUint = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
const hex = (bytes: Uint8Array): string => Buffer.from(bytes).toString('hex');
const isHex = (value: unknown): value is string =>
  typeof value === 'string' && /^(?:[0-9a-fA-F]{2})*$/.test(value);

const satoshis = (value: unknown): bigint => {
  if (
    (typeof value !== 'number' && typeof value !== 'string') ||
    String(value).length > 128
  )
    throw Error('Invalid BCH output value');
  const match = /^(\d+)(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/.exec(String(value));
  if (!match) throw Error('Invalid BCH output decimal');
  const fraction = match[2] ?? '';
  const exponent = Number(match[3] ?? 0);
  const shift = 8 + exponent - fraction.length;
  if (!Number.isSafeInteger(exponent) || Math.abs(shift) > 32)
    throw Error('BCH output exponent out of range');
  const digits = BigInt(match[1] + fraction);
  if (shift < 0 && digits % 10n ** BigInt(-shift))
    throw Error('Fractional satoshi RPC value');
  const amount =
    shift >= 0 ? digits * 10n ** BigInt(shift) : digits / 10n ** BigInt(-shift);
  if (amount > 0xffffffffffffffffn) throw Error('BCH output exceeds uint64');
  return amount;
};

const validateToken = (metadata: unknown, output: Output): void => {
  if (metadata === undefined) return;
  if (!output.token) {
    if (metadata !== null) throw Error('RPC invented CashToken metadata');
    return;
  }
  if (
    !isRecord(metadata) ||
    metadata.category !== hex(output.token.category) ||
    metadata.amount !== output.token.amount.toString()
  )
    throw Error('CashToken metadata mismatch');
  if (!output.token.nft) {
    if (metadata.nft !== undefined) throw Error('RPC invented NFT metadata');
  } else if (
    !isRecord(metadata.nft) ||
    metadata.nft.capability !== output.token.nft.capability ||
    metadata.nft.commitment !== hex(output.token.nft.commitment)
  )
    throw Error('CashToken NFT metadata mismatch');
};

/** Verifies both getblock and fetched metadata against one raw-byte transaction. */
export const validateBitcoinCashTransactionMetadata = (
  value: unknown,
  decoded: TransactionCommon,
  txid: string,
): void => {
  if (
    !isRecord(value) ||
    value.txid !== txid ||
    !Array.isArray(value.vin) ||
    !Array.isArray(value.vout) ||
    value.vin.length !== decoded.inputs.length ||
    value.vout.length !== decoded.outputs.length
  )
    throw Error('BCH transaction RPC shape or identity mismatch');
  if (
    (value.hash !== undefined && value.hash !== txid) ||
    (value.version !== undefined && value.version !== decoded.version) ||
    (value.locktime !== undefined && value.locktime !== decoded.locktime)
  )
    throw Error('BCH transaction scalar metadata mismatch');
  const inputs = value.vin;
  const outputs = value.vout;
  decoded.inputs.forEach((input, index) => {
    const rpc = inputs[index];
    if (!isRecord(rpc)) throw Error('Invalid BCH input');
    const coinbase =
      hex(input.outpointTransactionHash) === '00'.repeat(32) &&
      input.outpointIndex === 0xffffffff;
    if (
      coinbase
        ? !isHex(rpc.coinbase) || rpc.coinbase !== hex(input.unlockingBytecode)
        : rpc.coinbase !== undefined ||
          rpc.txid !== hex(input.outpointTransactionHash) ||
          rpc.vout !== input.outpointIndex
    )
      throw Error('BCH input outpoint mismatch');
    if (
      rpc.scriptSig !== undefined &&
      (!isRecord(rpc.scriptSig) ||
        rpc.scriptSig.hex !== hex(input.unlockingBytecode))
    )
      throw Error('BCH input script mismatch');
    if (rpc.sequence !== undefined && rpc.sequence !== input.sequenceNumber)
      throw Error('BCH input sequence mismatch');
  });
  decoded.outputs.forEach((output, index) => {
    const rpc = outputs[index];
    if (
      !isRecord(rpc) ||
      rpc.n !== index ||
      !isRecord(rpc.scriptPubKey) ||
      !isHex(rpc.scriptPubKey.hex) ||
      rpc.scriptPubKey.hex.toLowerCase() !== hex(output.lockingBytecode) ||
      satoshis(rpc.value) !== output.valueSatoshis
    )
      throw Error('BCH output metadata mismatch');
    validateToken(rpc.tokenData, output);
  });
};

export const validateBitcoinCashRawTransaction = (
  value: unknown,
  expectedTxId: string,
  blockHash: string,
  requireBlockHash: boolean,
): {
  transaction: BitcoinCashRpcTransaction;
  decoded: TransactionCommon;
  byteLength: number;
} => {
  if (
    !isRecord(value) ||
    typeof value.hex !== 'string' ||
    !value.hex.length ||
    value.hex.length > BITCOIN_CASH_RPC_LIMITS.transactionBytes * 2 ||
    !isHex(value.hex) ||
    ((requireBlockHash || value.blockhash !== undefined) &&
      value.blockhash !== blockHash)
  )
    throw Error('Missing or invalid BCH raw transaction/block identity');
  // Buffer.slice() aliases bytes; libauth requires real Uint8Array copies.
  const bytes = Uint8Array.from(Buffer.from(value.hex, 'hex'));
  const decoded = decodeTransactionBCH(bytes);
  if (
    typeof decoded === 'string' ||
    hashTransaction(bytes) !== expectedTxId ||
    hex(encodeTransactionBCH(decoded)) !== value.hex.toLowerCase() ||
    decoded.inputs.length < 1 ||
    decoded.inputs.length > BITCOIN_CASH_RPC_LIMITS.transactionIO ||
    decoded.outputs.length < 1 ||
    decoded.outputs.length > BITCOIN_CASH_RPC_LIMITS.transactionIO
  )
    throw Error('BCH raw bytes mismatch or bounded decoding failure');
  if (value.size !== undefined && value.size !== bytes.length)
    throw Error('BCH raw transaction size mismatch');
  validateBitcoinCashTransactionMetadata(value, decoded, expectedTxId);
  return {
    transaction: value as unknown as BitcoinCashRpcTransaction,
    decoded,
    byteLength: bytes.length,
  };
};
