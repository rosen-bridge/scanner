export interface SpendInfo {
  boxId: string;
  txId: string;
  index: number;
}

export interface ErgoExtractedData {
  boxId: string;
  height: number;
  blockId: string;
  spendBlock?: string;
  spendHeight?: number;
}
