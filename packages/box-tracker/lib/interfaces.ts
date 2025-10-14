import { AdditionalRegisters, Asset } from '@rosen-bridge/scanner-interfaces';

export type Token = {
  tokenId: string;
  amount: bigint;
};

export type ErgoBox = {
  boxId: string;
  value: bigint;
  ergoTree: string;
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
