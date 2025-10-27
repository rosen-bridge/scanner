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

export interface OrdiscanResponse<Data> {
  data: Data;
}

export interface OrdiscanRunesData {
  txid: string;
  runestone_messages: OrdiscanRunestoneMessage[];
  inputs: OrdiscanRunesTxInputUtxo[];
  outputs: OrdiscanRunesTxOutputUtxo[];
}

export interface OrdiscanRunesTxInputUtxo {
  address: string;
  output?: string;
  rune: string;
  rune_amount: string;
}

export interface OrdiscanRunesTxOutputUtxo {
  address: string;
  output?: string;
  rune: string;
  rune_amount: string;
  vout: number;
}

export interface OrdiscanRunestoneMessage {
  rune: string;
  type: string;
}

export interface OrdiscanRuneInfo {
  id: string;
  name: string;
  formatted_name: string;
  spacers: number;
  number: number;
  inscription_id: string;
  decimals: number;
  mint_count_cap: string;
  symbol: string;
  etching_txid: string;
  amount_per_mint: string;
  timestamp_unix: string;
  premined_supply: string;
  mint_start_block: number | null;
  mint_end_block: number | null;
  current_supply: string;
  current_mint_count: number;
}
