import { OutputBox, Transaction } from '@rosen-bridge/scanner-interfaces';
import { TransactionEntity, TxPot } from '@rosen-bridge/tx-pot';

export type Token = {
  tokenId: string;
  amount: bigint;
};

export interface ErgoBox extends OutputBox {
  blockId: string;
}

export interface MempoolTrackResult {
  boxes: OutputBox[];
  spentBoxIds: string[];
}

export type TxDeserializer = (serializedTx: TransactionEntity) => Transaction;

export type TxPotOptions = {
  txPot: TxPot;
  txDeserializer: TxDeserializer;
};
