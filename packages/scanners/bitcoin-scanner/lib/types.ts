export interface EsploraBlock {
  id: string;
  height: number;
  version: number;
  timestamp: number;
  tx_count: number;
  size: number;
  weight: number;
  merkle_root: string;
  previousblockhash: string;
  mediantime: number;
  nonce: number;
  bits: number;
  difficulty: number;
}

export interface EsploraTxInput {
  txid: string;
  vout: number;
  prevout: {
    scriptpubkey: string;
    scriptpubkey_asm: string;
    scriptpubkey_type: string;
    scriptpubkey_address: string;
    value: number;
  };
  scriptsig: string;
  scriptsig_asm: string;
  is_coinbase: false;
  sequence: number;
}

export interface EsploraTxOutput {
  scriptpubkey: string;
  scriptpubkey_asm: string;
  scriptpubkey_type: string;
  scriptpubkey_address: string;
  value: number;
}

export interface BitcoinEsploraTransaction {
  txid: string;
  version: number;
  locktime: number;
  vin: Array<EsploraTxInput>;
  vout: Array<EsploraTxOutput>;
  size: number;
  weight: number;
  fee: number;
  status: {
    confirmed: true;
    block_height: number;
    block_hash: string;
    block_time: number;
  };
}

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
