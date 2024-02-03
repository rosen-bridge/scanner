import { DataSource } from 'typeorm';

export interface BitcoinRPCConfig {
  rpcUrl: string;
  timeout: number;
  initialHeight: number;
  dataSource: DataSource;
}

export type JsonRpcResult = {
  id: number;
  result: any;
};

export type JsonRpcError = {
  id: number;
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

export interface BlockInfo {
  hash: string;
  height: number;
  time: number;
  nTx: number;
  previousblockhash: string;
  tx: Array<string>;
}

export interface BlockChainInfo {
  blocks: number;
  bestblockhash: string;
}

export interface BitcoinRPCTxInput {
  txid: string;
  vout: number;
  scriptSig: {
    asm: string;
    hex: string;
  };
  txinwitness: Array<string>;
  sequence: number;
}

export interface BitcoinRPCTxOutput {
  value: number;
  n: number;
  scriptPubKey: {
    asm: string;
    hex: string;
  };
}

export interface BitcoinRPCTransaction {
  txid: string;
  hash: string;
  version: number;
  size: number;
  vsize: number;
  weight: number;
  locktime: number;
  vin: Array<BitcoinRPCTxInput>;
  vout: Array<BitcoinRPCTxOutput>;
  hex: string;
  blockhash: string;
  confirmations: number;
  time: number;
  blocktime: number;
}
