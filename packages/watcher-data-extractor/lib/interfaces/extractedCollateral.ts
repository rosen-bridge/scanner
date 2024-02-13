export interface ExtractedCollateral {
  boxId: string;
  boxSerialized: string;
  wId: string;
  rwtCount: bigint;
  txId: string;
  block?: string;
  height?: number;
  spendBlock?: string;
  spendHeight?: number;
}
