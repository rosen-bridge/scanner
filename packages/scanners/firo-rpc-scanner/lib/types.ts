// Core RPC Response Types
export type JsonRpcResult = {
  id: string;
  result: unknown;
};

export type JsonRpcError = {
  id: string;
  error: {
    code: number;
    message?: string;
    data?: unknown;
  };
};

// Coinbase transaction (in Firo getblock RPC response)
export interface FiroRpcCoinbaseTransaction {
  version: number;
  height: number;
  merkleRootMNList: string;
}

// Firo getblock RPC response
export interface FiroRpcBlock {
  hash: string;
  confirmations: number;
  size: number;
  strippedsize?: number;
  weight?: number;
  height: number;
  version: number;
  versionHex: string;
  merkleroot: string;
  tx: Array<string>;
  cbTx?: FiroRpcCoinbaseTransaction;
  time: number;
  mediantime: number;
  nonce: number;
  bits: string;
  difficulty: number;
  chainwork: string;
  previousblockhash?: string;
  nextblockhash?: string;
}

// Transaction input types (in Firo getrawtransaction RPC response)
export interface FiroRpcTxInput {
  txid: string;
  vout: number;
  scriptSig: {
    asm: string;
    hex: string;
  };
  sequence: number;
  txinwitness?: string[];
}

// Transaction output types (in Firo getrawtransaction RPC response)
export interface FiroRpcTxOutput {
  value: number;
  n: number;
  scriptPubKey: {
    asm: string;
    hex: string;
    reqSigs?: number;
    type: string;
    addresses?: string[];
  };
}

// Firo getrawtransaction RPC response
export interface FiroRpcTransaction {
  hex: string;
  txid: string;
  hash: string;
  size: number;
  vsize: number;
  version: number;
  locktime: number;
  vin: Array<FiroRpcTxInput>;
  vout: Array<FiroRpcTxOutput>;
  blockhash?: string;
  confirmations?: number;
  time?: number;
  blocktime?: number;
  instantlock?: boolean;
  chainlock?: boolean;
}
