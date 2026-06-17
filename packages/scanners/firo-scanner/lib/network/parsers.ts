import { createHash } from 'node:crypto';

import { Block } from '@rosen-bridge/scanner-interfaces';

import { FiroRpcTransaction, FiroRpcTxInput, FiroRpcTxOutput } from '../types';

/**
 * Parses an 80-byte serialized Firo block header and derives the block hash,
 * parent hash and timestamp from its fields.
 * @param hex hex-encoded block header (must decode to exactly 80 bytes)
 * @returns Block fields excluding height
 */
export const parseBlockHeader = (hex: string): Omit<Block, 'height'> => {
  const raw = Buffer.from(hex, 'hex');
  if (raw.length < 80) {
    throw new Error(
      `Invalid block header: expected 80 bytes, got ${raw.length}`,
    );
  }

  // bytes 0-3: version (LE)
  // bytes 4-35: previous block hash (32 bytes, LE internal → reverse for display)
  // bytes 36-67: merkle root (32 bytes)
  // bytes 68-71: timestamp (LE uint32)
  // bytes 72-75: bits
  // bytes 76-79: nonce

  const parentHash = raw
    .subarray(4, 36)
    .toString('hex')
    .match(/.{2}/g)!
    .reverse()
    .join('');
  const timestamp = raw.readUInt32LE(68);

  // Block hash = double-SHA256 of 80 header bytes, reversed for display
  const hash = createHash('sha256')
    .update(createHash('sha256').update(raw).digest())
    .digest()
    .reverse()
    .toString('hex');

  return {
    hash,
    parentHash,
    timestamp,
  };
};

/**
 * Parses a serialized Firo transaction into its version, inputs, outputs and
 * locktime. Note that Firo encodes the transaction type in the upper 16 bits
 * of the version field.
 * @param hex hex-encoded raw transaction
 * @returns FiroRpcTransaction fields excluding txid and hash
 */
export const parseTransaction = (
  hex: string,
): Omit<FiroRpcTransaction, 'txid' | 'hash'> => {
  const raw = Buffer.from(hex, 'hex');
  let offset = 0;

  // Firo packs tx type into the upper 16 bits of the same 4-byte field.
  const version = raw.readUInt32LE(offset) & 0xffff;
  offset += 4;

  // Parse vin
  const { value: vinCount, offset: newOff } = parseCompactSize(raw, offset);
  offset = newOff;

  const vin: Array<FiroRpcTxInput> = [];
  for (let i = 0; i < vinCount; i++) {
    const input = parseTxInput(raw, offset);
    vin.push(input.vin);
    offset = input.nextOffset;
  }

  // Parse vout
  const { value: voutCount, offset: newOff2 } = parseCompactSize(raw, offset);
  offset = newOff2;

  const vout: Array<FiroRpcTxOutput> = [];
  for (let i = 0; i < voutCount; i++) {
    const output = parseTxOutput(raw, offset);
    vout.push({ ...output.vout, n: i });
    offset = output.nextOffset;
  }

  // Locktime (4 bytes LE)
  const locktime = raw.readUInt32LE(offset);
  offset += 4;

  return {
    hex,
    size: raw.length,
    vsize: raw.length,
    version,
    locktime,
    vin,
    vout,
  };
};

/**
 * Parses a single Firo transaction input starting at the given offset in the
 * provided buffer.
 * @param raw raw transaction bytes
 * @param offset byte offset at which the input starts
 * @returns parsed input and the offset immediately after it
 */
export const parseTxInput = (
  raw: Buffer,
  offset: number,
): { vin: FiroRpcTxInput; nextOffset: number } => {
  // Previous txid (32 bytes, reversed for display)
  const prevTxid = raw
    .subarray(offset, offset + 32)
    .toString('hex')
    .match(/.{2}/g)!
    .reverse()
    .join('');
  offset += 32;

  // Previous vout index (4 bytes LE)
  const prevVout = raw.readUInt32LE(offset);
  offset += 4;

  // ScriptSig (varstr)
  const { value: scriptLen, offset: newOff } = parseCompactSize(raw, offset);
  offset = newOff;
  const scriptSigHex = raw.subarray(offset, offset + scriptLen).toString('hex');
  offset += scriptLen;

  // Sequence (4 bytes LE)
  const sequence = raw.readUInt32LE(offset);
  offset += 4;

  return {
    vin: {
      txid: prevTxid,
      vout: prevVout,
      scriptSig: {
        asm: '',
        hex: scriptSigHex,
      },
      sequence,
    },
    nextOffset: offset,
  };
};

/**
 * Parses a single Firo transaction output starting at the given offset in the
 * provided buffer. The returned `vout` does not include the output index `n`,
 * which is assigned by the caller.
 * @param raw raw transaction bytes
 * @param offset byte offset at which the output starts
 * @returns parsed output and the offset immediately after it
 */
export const parseTxOutput = (
  raw: Buffer,
  offset: number,
): { vout: Omit<FiroRpcTxOutput, 'n'>; nextOffset: number } => {
  // Value in satoshis (8 bytes LE int64)
  const valueSat = raw.readBigInt64LE(offset);
  const value = Number(valueSat) / 1e8;
  offset += 8;

  // ScriptPubKey (varstr)
  const { value: scriptLen, offset: newOff } = parseCompactSize(raw, offset);
  offset = newOff;
  const scriptHex = raw.subarray(offset, offset + scriptLen).toString('hex');
  offset += scriptLen;

  return {
    vout: {
      value,
      scriptPubKey: {
        asm: '',
        hex: scriptHex,
        type: '',
      },
    },
    nextOffset: offset,
  };
};

/**
 * Reads a Bitcoin-style CompactSize (varint) value from the buffer. Values
 * encoded with the 8-byte form are clamped to a JavaScript `number`, which is
 * safe for practical input/output counts and script lengths.
 * @param raw buffer to read from
 * @param offset byte offset of the CompactSize prefix
 * @returns decoded value and the offset immediately after it
 */
export const parseCompactSize = (
  raw: Buffer,
  offset: number,
): { value: number; offset: number } => {
  const first = raw[offset];
  if (first < 0xfd) {
    return { value: first, offset: offset + 1 };
  }
  if (first === 0xfd) {
    return { value: raw.readUInt16LE(offset + 1), offset: offset + 3 };
  }
  if (first === 0xfe) {
    return { value: raw.readUInt32LE(offset + 1), offset: offset + 5 };
  }
  // 0xff: 8 bytes — read as BigInt, clamp to Number (safe for practical tx counts)
  const big = raw.readBigUInt64LE(offset + 1);
  return { value: Number(big), offset: offset + 9 };
};
