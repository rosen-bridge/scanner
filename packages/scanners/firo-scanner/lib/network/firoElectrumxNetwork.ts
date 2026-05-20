import * as net from 'net';
import { createHash } from 'crypto';

import {
  AbstractNetworkConnector,
  Block,
} from '@rosen-bridge/scanner-interfaces';

import { FiroRpcTransaction, FiroRpcTxInput, FiroRpcTxOutput } from '../types';

interface ElectrumXResponse {
  jsonrpc: '2.0';
  id: number;
  result?: unknown;
  error?: {
    code: number;
    message: string;
  };
}

class FiroElectrumXNetwork extends AbstractNetworkConnector<FiroRpcTransaction> {
  private readonly host: string;
  private readonly port: number;
  private readonly timeout: number;

  private socket: net.Socket | null = null;
  private nextId = 1;
  private pending = new Map<
    number,
    {
      resolve: (v: unknown) => void;
      reject: (e: Error) => void;
      timer: ReturnType<typeof setTimeout>;
    }
  >();
  private recvBuffer = '';
  private connectPromise: Promise<void> | null = null;
  private versionSent = false;
  private reconnectBackoff = 1000;

  // Cache block hash → height mappings for getBlockTxs lookups
  private hashToHeight = new Map<string, number>();

  constructor(host: string, port: number, timeout = 30000) {
    super();
    this.host = host;
    this.port = port;
    this.timeout = timeout;
  }

  // ---------------- AbstractNetworkConnector implementation ----------------

  getCurrentHeight = async (): Promise<number> => {
    const result = await this.sendRequest('blockchain.headers.subscribe', []);
    const typed = result as { height: number };
    return typed.height;
  };

  getBlockAtHeight = async (height: number): Promise<Block> => {
    const rawHeader = await this.sendRequest('blockchain.block.header', [
      height,
    ]);
    const headerHex = rawHeader as string;
    const header = this.parseBlockHeader(headerHex, height);

    // Cache for later getBlockTxs lookup
    this.hashToHeight.set(header.hash, height);

    return header;
  };

  getBlockTxs = async (
    blockHash: string,
  ): Promise<Array<FiroRpcTransaction>> => {
    const height = this.hashToHeight.get(blockHash);
    if (height === undefined) {
      throw new Error(
        `No cached height for block hash ${blockHash}. ` +
          `getBlockAtHeight must be called before getBlockTxs for the same block.`,
      );
    }

    // 1. Get all txids in the block
    const txids = (await this.sendRequest('blockchain.block.txids', [
      height,
    ])) as Array<string>;

    // 2. Fetch each transaction hex and parse it
    const transactions: Array<FiroRpcTransaction> = [];
    for (const txid of txids) {
      try {
        const hex = (await this.sendRequest('blockchain.transaction.get', [
          txid,
          false,
        ])) as string;
        transactions.push(this.parseTransactionHex(hex, txid));
      } catch (error) {
        console.warn(`Failed to fetch transaction ${txid}: ${error}`);
      }
    }

    return transactions;
  };

  // ---------------- TCP Connection Management ----------------

  private ensureConnected = async (): Promise<void> => {
    // Already connected and version handshake done
    if (this.socket && !this.socket.destroyed && this.versionSent) {
      return;
    }

    // Connection already in progress — wait for it
    if (this.connectPromise) {
      return this.connectPromise;
    }

    this.connectPromise = this.doConnect();
    try {
      await this.connectPromise;
    } finally {
      this.connectPromise = null;
    }
  };

  private doConnect = (): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      this.versionSent = false;
      this.socket = net.createConnection(this.port, this.host);

      const onError = (err: Error) => {
        cleanup();
        reject(err);
      };

      const onData = (data: Buffer) => {
        this.recvBuffer += data.toString('utf-8');
        this.processBuffer();
      };

      const cleanup = () => {
        if (this.socket) {
          this.socket.removeListener('error', onError);
          this.socket.removeListener('data', onData);
        }
      };

      this.socket.once('error', onError);
      this.socket.on('data', onData);

      this.socket.once('connect', async () => {
        // Remove the connect-time error handler; replace with reconnect handler
        this.socket!.removeListener('error', onError);
        this.socket!.on('error', this.onSocketError);
        this.socket!.on('close', this.onSocketClose);

        // Send server.version first
        try {
          await this.sendRequest('server.version', ['rosen-scanner', '1.4']);
          this.versionSent = true;
          this.reconnectBackoff = 1000; // reset backoff on successful connect
          resolve();
        } catch (e) {
          reject(e);
        }
      });
    });
  };

  private onSocketError = (err: Error) => {
    this.versionSent = false;
    this.rejectAllPending(err);
  };

  private onSocketClose = () => {
    this.versionSent = false;
    this.rejectAllPending(new Error('ElectrumX connection closed'));
    this.scheduleReconnect();
  };

  private scheduleReconnect = () => {
    setTimeout(() => {
      this.connectPromise = this.doConnect();
      this.connectPromise.catch(() => {
        // Backoff — try again later
        this.reconnectBackoff = Math.min(
          this.reconnectBackoff * 2,
          30000,
        );
        this.scheduleReconnect();
      });
    }, this.reconnectBackoff);
  };

  private rejectAllPending = (err: Error) => {
    for (const [, entry] of this.pending) {
      clearTimeout(entry.timer);
      entry.reject(err);
    }
    this.pending.clear();
  };

  // ---------------- JSON-RPC request/response ----------------

  private sendRequest = (method: string, params: unknown[]): Promise<unknown> => {
    return new Promise<unknown>((resolve, reject) => {
      const doSend = () => {
        const id = this.nextId++;
        const request = JSON.stringify({
          jsonrpc: '2.0',
          id,
          method,
          params,
        });

        const timer = setTimeout(() => {
          this.pending.delete(id);
          reject(
            new Error(
              `ElectrumX request timeout [${method}] after ${this.timeout}ms`,
            ),
          );
        }, this.timeout);

        this.pending.set(id, { resolve, reject, timer });

        try {
          this.socket!.write(request + '\n');
        } catch (err) {
          clearTimeout(timer);
          this.pending.delete(id);
          reject(err);
        }
      };

      // Ensure we're connected, then send
      this.ensureConnected()
        .then(doSend)
        .catch(reject);
    });
  };

  private processBuffer = () => {
    let newlineIdx: number;
    while ((newlineIdx = this.recvBuffer.indexOf('\n')) !== -1) {
      const line = this.recvBuffer.slice(0, newlineIdx);
      this.recvBuffer = this.recvBuffer.slice(newlineIdx + 1);

      if (!line.trim()) continue;

      try {
        const response: ElectrumXResponse = JSON.parse(line);
        const pending = this.pending.get(response.id);

        if (pending) {
          clearTimeout(pending.timer);
          this.pending.delete(response.id);

          if (response.error) {
            pending.reject(
              new Error(
                `ElectrumX error [${response.error.code}]: ${response.error.message}`,
              ),
            );
          } else {
            pending.resolve(response.result);
          }
        }
        // Responses with ids not in pending are ignored (notifications, stale, etc.)
      } catch {
        // Malformed JSON — ignore
      }
    }
  };

  // ---------------- Block Header Parser (80-byte raw header) ----------------

  private parseBlockHeader = (hex: string, height: number): Block => {
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

    const parentHash = raw.subarray(4, 36).toString('hex').match(/.{2}/g)!.reverse().join('');
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
      height,
      timestamp,
    };
  };

  // ---------------- Transaction Hex Parser ----------------

  private parseTransactionHex = (
    hex: string,
    txid: string,
  ): FiroRpcTransaction => {
    const raw = Buffer.from(hex, 'hex');
    let offset = 0;

    // Version (4 bytes LE)
    const version = raw.readInt32LE(offset);
    offset += 4;

    // Firo tx version >= 3 has a 2-byte type field
    if (version >= 3) {
      offset += 2; // skip type field
    }

    // Parse vin
    const { value: vinCount, offset: newOff } = this.readVarInt(raw, offset);
    offset = newOff;

    const vin: Array<FiroRpcTxInput> = [];
    for (let i = 0; i < vinCount; i++) {
      const input = this.parseTxInput(raw, offset);
      vin.push(input.vin);
      offset = input.nextOffset;
    }

    // Parse vout
    const { value: voutCount, offset: newOff2 } = this.readVarInt(raw, offset);
    offset = newOff2;

    const vout: Array<FiroRpcTxOutput> = [];
    for (let i = 0; i < voutCount; i++) {
      const output = this.parseTxOutput(raw, offset, i);
      vout.push(output.vout);
      offset = output.nextOffset;
    }

    // Locktime (4 bytes LE)
    const locktime = raw.readUInt32LE(offset);
    offset += 4;

    return {
      hex,
      txid,
      hash: txid,
      size: raw.length,
      vsize: raw.length,
      version,
      locktime,
      vin,
      vout,
    };
  };

  private parseTxInput = (
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
    const { value: scriptLen, offset: newOff } = this.readVarInt(raw, offset);
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

  private parseTxOutput = (
    raw: Buffer,
    offset: number,
    index: number,
  ): { vout: FiroRpcTxOutput; nextOffset: number } => {
    // Value in satoshis (8 bytes LE int64)
    const valueSat = raw.readBigInt64LE(offset);
    const value = Number(valueSat) / 1e8;
    offset += 8;

    // ScriptPubKey (varstr)
    const { value: scriptLen, offset: newOff } = this.readVarInt(raw, offset);
    offset = newOff;
    const scriptHex = raw.subarray(offset, offset + scriptLen).toString('hex');
    offset += scriptLen;

    return {
      vout: {
        value,
        n: index,
        scriptPubKey: {
          asm: '',
          hex: scriptHex,
          type: '',
        },
      },
      nextOffset: offset,
    };
  };

  private readVarInt = (
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
}

export { FiroElectrumXNetwork };
