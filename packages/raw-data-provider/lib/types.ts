import { Block, TipOrOrigin } from '@cardano-ogmios/schema';
import { TransactionJSON } from '@emurgo/cardano-serialization-lib-nodejs';

export interface ConnectionByAuthInfoInterface {
  url: string;
  authToken?: string;
}

export interface RpcConnectionInfoInterface {
  url: string;
  timeout: number;
  username?: string;
  password?: string;
}

export interface EsploraConnectionInfoInterface {
  url: string;
  prefix?: string;
  timeout?: number;
}

export interface OgmiosConnectionInfoInterface {
  host: string;
  port: number;
  tls?: boolean;
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

export type KoiosTransaction = KoiosCborTx & TransactionJSON;

export interface ForwardResponse {
  block: Block;
  tip: TipOrOrigin;
}

export interface PointType {
  slot: number;
  hash: string;
}
