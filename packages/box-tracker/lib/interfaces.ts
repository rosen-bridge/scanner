import {
  AdditionalRegisters,
  Asset,
  BlockInfo,
  Transaction,
} from '@rosen-bridge/scanner-interfaces';

export type Token = {
  tokenId: string;
  amount: bigint;
};

export type ErgoBox = {
  boxId: string;
  value: bigint;
  ergoTree: string;
  BlockId?: string;
  creationHeight: number;
  assets: Array<Asset>;
  additionalRegisters: AdditionalRegisters;
  transactionId: string;
  index: number;
};

export interface MempoolTrackResult {
  boxes: ErgoBox[];
  spentBoxIds: string[];
}

export type TxDeserializer = (serializedTx: string) => Transaction;

export type BoxWithBlock = {
  box: ErgoBox;
  blockInfo: BlockInfo;
};
