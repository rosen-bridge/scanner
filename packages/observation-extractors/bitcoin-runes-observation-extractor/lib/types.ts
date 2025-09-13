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
