import { TransactionJSON } from '@emurgo/cardano-serialization-lib-nodejs';

interface KoiosCborTx {
  tx_hash: string;
  block_hash: string;
  block_height: number;
  epoch_no: number;
  absolute_slot: number;
  tx_timestamp: number;
  cbor: string;
  valid_contract: boolean;
}

type KoiosTransaction = KoiosCborTx & TransactionJSON;

export { KoiosTransaction };
