import { createHash } from 'crypto';

// Build a valid 80-byte Firo block header for testing
function buildTestHeader(): { hex: string; hash: string; parentHash: string } {
  const buf = Buffer.alloc(80);

  // Version (4 bytes LE) — use version 2
  buf.writeUInt32LE(2, 0);

  // Previous block hash (32 bytes, at offset 4) — use a recognizable pattern
  const parentHashRaw = Buffer.from(
    '0a1b2c3d4e5f6789abcdef01234567890abcdef0123456789abcdef0123456789',
    'hex',
  );
  parentHashRaw.copy(buf, 4);

  // Merkle root (32 bytes, at offset 36)
  const merkleRaw = Buffer.from(
    '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    'hex',
  );
  merkleRaw.copy(buf, 36);

  // Timestamp (4 bytes LE, at offset 68)
  buf.writeUInt32LE(1716163200, 68);

  // Bits (4 bytes LE, at offset 72)
  buf.writeUInt32LE(0x1a0f2b3c, 72);

  // Nonce (4 bytes LE, at offset 76)
  buf.writeUInt32LE(0, 76);

  const hex = buf.toString('hex');

  // Block hash = double-SHA256 of 80 header bytes, reversed for display
  const hash = createHash('sha256')
    .update(createHash('sha256').update(buf).digest())
    .digest()
    .reverse()
    .toString('hex');

  // Parent hash in display format (LE internal → reverse bytes for display)
  const parentHash = parentHashRaw
    .toString('hex')
    .match(/.{2}/g)!
    .reverse()
    .join('');

  return { hex, hash, parentHash };
}

export const blockHeader = buildTestHeader();

// Build a minimal Firo tx (version 2, 1 vin, 1 vout) for testing
function buildTestTx(): {
  hex: string;
  txid: string;
  expectedVin: Array<{ txid: string; vout: number }>;
  expectedVout: Array<{ value: number; scriptHex: string }>;
} {
  const parts: Buffer[] = [];

  // Version (4 bytes LE) — version 2 (no type field)
  const version = Buffer.alloc(4);
  version.writeUInt32LE(2, 0);
  parts.push(version);

  // Vin count = 1
  parts.push(Buffer.from([0x01]));

  // Vin[0]:
  // - Previous txid (32 bytes)
  const prevTxidRaw = Buffer.from(
    'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
    'hex',
  );
  parts.push(prevTxidRaw);
  // - Previous vout index (4 bytes LE)
  const prevVout = Buffer.alloc(4);
  prevVout.writeUInt32LE(3, 0);
  parts.push(prevVout);
  // - ScriptSig: empty (varint 0x00)
  parts.push(Buffer.from([0x00]));
  // - Sequence (4 bytes LE)
  const seq = Buffer.alloc(4);
  seq.writeUInt32LE(0xffffffff, 0);
  parts.push(seq);

  // Vout count = 1
  parts.push(Buffer.from([0x01]));

  // Vout[0]:
  // - Value: 100000000 satoshis = 1 BTC (8 bytes LE int64)
  const value = Buffer.alloc(8);
  value.writeBigUInt64LE(BigInt(100000000), 0);
  parts.push(value);
  // - ScriptPubKey: 0x19 bytes of data
  const script = Buffer.from(
    '76a914abcdefabcdefabcdefabcdefabcdefabcdef88ac',
    'hex',
  );
  const scriptLen = Buffer.from([script.length]); // 0x19 = 25
  parts.push(scriptLen);
  parts.push(script);

  // Locktime (4 bytes LE)
  const locktime = Buffer.alloc(4);
  locktime.writeUInt32LE(0, 0);
  parts.push(locktime);

  const raw = Buffer.concat(parts);
  const hex = raw.toString('hex');

  // txid = double-SHA256 of raw tx, reversed for display
  const txid = createHash('sha256')
    .update(createHash('sha256').update(raw).digest())
    .digest()
    .reverse()
    .toString('hex');

  const prevTxidDisplay = prevTxidRaw
    .toString('hex')
    .match(/.{2}/g)!
    .reverse()
    .join('');

  return {
    hex,
    txid,
    expectedVin: [{ txid: prevTxidDisplay, vout: 3 }],
    expectedVout: [{ value: 1.0, scriptHex: script.toString('hex') }],
  };
}

export const testTx = buildTestTx();

// A Firo tx version 3 (with type field) for testing
function buildTestTxV3(): {
  hex: string;
  txid: string;
} {
  const parts: Buffer[] = [];

  // Version (4 bytes LE) — version 3
  const version = Buffer.alloc(4);
  version.writeUInt32LE(3, 0);
  parts.push(version);

  // Type field (2 bytes LE) — Firo-specific
  const typeField = Buffer.alloc(2);
  typeField.writeUInt16LE(0, 0);
  parts.push(typeField);

  // Vin count = 1
  parts.push(Buffer.from([0x01]));

  // Vin[0]:
  const prevTxidRaw = Buffer.alloc(32); // all zeros
  parts.push(prevTxidRaw);
  const prevVout = Buffer.alloc(4);
  prevVout.writeUInt32LE(0, 0);
  parts.push(prevVout);
  parts.push(Buffer.from([0x00])); // empty scriptSig
  const seq = Buffer.alloc(4);
  seq.writeUInt32LE(0xffffffff, 0);
  parts.push(seq);

  // Vout count = 2
  parts.push(Buffer.from([0x02]));

  // Vout[0]: 50000000 satoshis = 0.5 BTC
  const value1 = Buffer.alloc(8);
  value1.writeBigUInt64LE(BigInt(50000000), 0);
  parts.push(value1);
  const script1 = Buffer.from(
    'a9141234567890abcdef1234567890abcdef1234567887',
    'hex',
  );
  parts.push(Buffer.from([script1.length]));
  parts.push(script1);

  // Vout[1]: 300000000 satoshis = 3 BTC
  const value2 = Buffer.alloc(8);
  value2.writeBigUInt64LE(BigInt(300000000), 0);
  parts.push(value2);
  const script2 = Buffer.from(
    '76a914deadbeefdeadbeefdeadbeefdeadbeefdeadbeef88ac',
    'hex',
  );
  parts.push(Buffer.from([script2.length]));
  parts.push(script2);

  // Locktime
  const locktime = Buffer.alloc(4);
  parts.push(locktime);

  const raw = Buffer.concat(parts);
  const hex = raw.toString('hex');
  const txid = createHash('sha256')
    .update(createHash('sha256').update(raw).digest())
    .digest()
    .reverse()
    .toString('hex');

  return { hex, txid };
}

export const testTxV3 = buildTestTxV3();
