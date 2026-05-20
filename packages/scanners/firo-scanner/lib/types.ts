// Transaction input types
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

// Transaction output types
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

// Firo transaction
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
