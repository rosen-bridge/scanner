export interface ExtractedFraud {
  identifier: string;
  serialized: string;
  triggerBoxId: string;
  wid: string;
  rwtCount: string;
  spendBlock?: string | null;
  spendHeight?: number | null;
  spendTxId?: string | null;
}
