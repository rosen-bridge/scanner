export interface ExtractedCollateral {
  boxId: string;
  boxSerialized: string;
  wid: string;
  rwtCount: bigint;
  txId: string;
  block: string;
  height: number;
  spendBlock?: string;
  spendHeight?: number;
  spendTxId?: string;
}
