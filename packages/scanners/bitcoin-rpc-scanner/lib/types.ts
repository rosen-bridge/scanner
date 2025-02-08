import { DataSource } from 'typeorm';

export interface BitcoinRPCConfig {
  rpcUrl: string;
  timeout: number;
  initialHeight: number;
  dataSource: DataSource;
  username?: string;
  password?: string;
}

export type JsonRpcResult = {
  id: string;
  result: any;
};

export type JsonRpcError = {
  id: string;
  error: {
    code: number;
    message?: string;
    data?: any;
  };
};

export interface BlockHeader {
  hash: string;
  height: number;
  time: number;
  nTx: number;
  previousblockhash: string;
}

export interface BlockChainInfo {
  blocks: number;
  bestblockhash: string;
}

export interface BitcoinRpcTxInput {
  txid: string;
  vout: number;
  scriptSig: {
    asm: string;
    hex: string;
  };
  txinwitness: Array<string>;
  sequence: number;
}

export interface BitcoinRpcTxOutput {
  value: number;
  n: number;
  scriptPubKey: {
    asm: string;
    hex: string;
  };
}

export interface BitcoinRpcTransaction {
  txid: string;
  hash: string;
  version: number;
  size: number;
  vsize: number;
  weight: number;
  locktime: number;
  vin: Array<BitcoinRpcTxInput>;
  vout: Array<BitcoinRpcTxOutput>;
  hex: string;
}

export interface DogeBlockSummary {
  hash: string;
  height: number;
  time: number;
  previousblockhash: string;
  tx: Array<string>;
}

export interface DogeRpcTxInput {
  txid: string;
  vout: number;
  scriptSig: {
    asm: string;
    hex: string;
  };
  sequence: number;
}

export interface DogeRpcTxOutput {
  value: number;
  n: number;
  scriptPubKey: {
    asm: string;
    hex: string;
    type: string;
  };
}

export interface DogeRpcTransaction {
  txid: string;
  hash: string;
  version: number;
  size: number;
  vsize: number;
  locktime: number;
  vin: Array<DogeRpcTxInput>;
  vout: Array<DogeRpcTxOutput>;
}
