import { OutputBox, Transaction } from '@rosen-bridge/scanner-interfaces';

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

export type TxDeserializer = (serializedTx: string) => Transaction;
