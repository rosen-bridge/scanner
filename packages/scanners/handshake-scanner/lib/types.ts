/**
 * Handshake RPC Transaction type
 */
export interface HandshakeRpcTransaction {
  txid: string;
  version: number;
  size: number;
  vsize: number;
  locktime: number;
  vin: Array<{
    txid: string;
    vout: number;
    txinwitness?: string[];
    sequence: number;
  }>;
  vout: Array<HandshakeRpcTxOutput>;
  hash: string;
}

export interface HandshakeRpcTxOutput {
  value: number;
  n: number;
  address: {
    version: number;
    hash: string;
    string: string;
  };
  covenant: {
    type: number;
    action: string;
    items: string[];
  };
}

export interface BlockHeader {
  hash: string;
  height: number;
  version: number;
  previousblockhash: string;
  merkleroot: string;
  time: number;
  bits: string;
  nonce: number;
  difficulty: number;
  nTx: number;
}

export interface JsonRpcResult {
  id: string;
  result: unknown;
  error?: {
    code: number;
    message: string;
  };
}
