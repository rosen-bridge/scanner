import { AbstractEntityData } from '@rosen-bridge/abstract-extractor';

export interface ExtractedCollateral extends AbstractEntityData {
  txId: string;
  wid: string;
  rwtCount: bigint;
  spendBlock?: string | null;
  spendHeight?: number | null;
}
