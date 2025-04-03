import { DataSource } from 'typeorm';

export interface DogeBlockcypherConfig {
  blockcypherUrl: string;
  timeout: number;
  initialHeight: number;
  dataSource: DataSource;
}

export interface BlockCypherTx {
  hash: string;
  ver: number;
  vin_sz: number;
  vout_sz: number;
  size: number;
  weight: number;
  fee: number;
  relayed_by: string;
  lock_time: number;
  txid: string;
  confidence: number;
  confirmed: string;
  received: string;
  double_spend: boolean;
  inputs: BlockCypherVin[];
  outputs: BlockCypherVout[];
  block_height?: number;
  block_hash?: string;
  confirmations: number;
  hex?: string;
}

export interface BlockCypherVin {
  prev_hash: string;
  output_index: number;
  script: string;
  output_value: number;
  sequence: number;
  addresses: string[];
  script_type: string;
}

export interface BlockCypherVout {
  value: number;
  script: string;
  addresses: string[];
  script_type: string;
  spent_by?: string;
}

export interface BlockCypherBlock {
  hash: string;
  height: number;
  chain: string;
  total: number;
  fees: number;
  size: number;
  ver: number;
  time: string;
  received_time: string;
  coinbase_addr: string;
  relayed_by: string;
  bits: number;
  nonce: number;
  n_tx: number;
  prev_block: string;
  mrkl_root: string;
  txids: string[];
  depth: number;
}

export interface BlockCypherChain {
  name: string;
  height: number;
  hash: string;
  time: string;
  latest_url: string;
  previous_hash: string;
  previous_url: string;
  peer_count: number;
  unconfirmed_count: number;
  high_fee_per_kb: number;
  medium_fee_per_kb: number;
  low_fee_per_kb: number;
  last_fork_height: number;
  last_fork_hash: string;
}
