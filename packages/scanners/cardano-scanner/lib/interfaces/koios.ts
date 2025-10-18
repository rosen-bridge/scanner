import { TransactionJSON } from '@emurgo/cardano-serialization-lib-nodejs';

interface KoiosBlock {
  hash: string;
  block_height: number;
  block_time: number;
  tx_count: number;
}

interface KoiosBlockInfo {
  hash: string;
  block_height: number;
  parent_hash: string;
  child_hash?: string;
}

interface KoiosCborTx {
  tx_hash: string;
  block_hash: string;
  block_height: number;
  epoch_no: number;
  absolute_slot: number;
  tx_timestamp: number;
  cbor: string;
}

type KoiosTransaction = KoiosCborTx & TransactionJSON;

export { KoiosBlock, KoiosBlockInfo, KoiosTransaction, KoiosCborTx };
