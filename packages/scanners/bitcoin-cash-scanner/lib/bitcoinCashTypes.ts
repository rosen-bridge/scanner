/** Explicit BCHN chain identity required for every scanner RPC call. */
export type BitcoinCashRpcChain = 'main' | 'test' | 'regtest';

export interface BitcoinCashRpcTokenData {
  category: string;
  amount: string;
  nft?: { capability: 'none' | 'mutable' | 'minting'; commitment: string };
}

export interface BitcoinCashRpcTxInput {
  txid?: string;
  vout?: number;
  coinbase?: string;
  scriptSig?: { asm?: string; hex: string };
  sequence?: number;
}

export interface BitcoinCashRpcTxOutput {
  value: number | string;
  n: number;
  scriptPubKey: {
    hex: string;
    asm?: string;
    type?: string;
    addresses?: string[];
  };
  tokenData?: BitcoinCashRpcTokenData | null;
}

/** Native BCH RPC transaction, preserving the exact raw bytes and CashTokens. */
export interface BitcoinCashRpcTransaction {
  hex: string;
  txid: string;
  vin: BitcoinCashRpcTxInput[];
  vout: BitcoinCashRpcTxOutput[];
  blockhash?: string;
  hash?: string;
  size?: number;
  version?: number;
  locktime?: number;
  confirmations?: number;
  time?: number;
  blocktime?: number;
}
