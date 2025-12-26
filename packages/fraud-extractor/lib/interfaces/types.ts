import { AbstractEntityData } from '@rosen-bridge/abstract-extractor';

export interface ExtractedFraud extends AbstractEntityData {
  txId: string;
  triggerBoxId: string;
  wid: string;
  rwtCount: string;
  spendBlock?: string | null;
  spendHeight?: number | null;
  spendTxId?: string | null;
}
