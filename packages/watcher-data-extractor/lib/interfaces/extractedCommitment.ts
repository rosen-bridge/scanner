import { AbstractEntityData } from '@rosen-bridge/abstract-extractor';

interface ExtractedCommitment extends AbstractEntityData {
  txId: string;
  WID: string;
  commitment: string;
  eventId: string;
  rwtCount: string;
  spendTxId?: string | null;
  spendIndex?: number | null;
}

export { ExtractedCommitment };
