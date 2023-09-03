interface ExtractedFraud {
  boxId: string;
  serialized: string;
  triggerBoxId: string;
  wid: string;
  rwtCount: string;
  blockId?: string;
  height?: number;
  txId?: string;
  spendBlock?: string;
  spendHeight?: number;
  spendTxId?: string;
}

export { ExtractedFraud };
