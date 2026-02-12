export type TxOutputRune = {
  address: string;
  vout: number;
  runeId: string;
  runeAmount: string;
};

export interface UnisatResponse<Data> {
  code: number;
  msg?: string;
  data: Data;
}

export interface UnisatTxRunes {
  detail: UnisatBoxDetail[];
  height: number;
  start: number;
  total: number;
}

export interface UnisatBoxDetail {
  type: string;
  address: string;
  amount: string;
  height: number;
  txidx: number;
  txid: string;
  timestamp: number;
  runeId: string;
  rune: string;
  spacedRune: string;
  divisibility: number;
  vout: number;
  spentTxid: string;
  spentVout: number;
}

export interface OrdiscanRunesData {
  txid: string;
  runestone_messages: OrdiscanRunestoneMessage[];
  inputs: OrdiscanRunesTxInputUtxo[];
  outputs: OrdiscanRunesTxOutputUtxo[];
  timestamp: string;
}

export interface OrdiscanRunesTxInputUtxo {
  address: string;
  output: string;
  rune: string;
  rune_amount: string;
}

export interface OrdiscanRunesTxOutputUtxo {
  address: string;
  rune: string;
  rune_amount: string;
  vout: number;
}

export interface OrdiscanRunestoneMessage {
  rune: string;
  type: 'TRANSFER' | 'MINT' | 'ETCH';
}
