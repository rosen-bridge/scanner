import { AbstractEntityData } from '@rosen-bridge/abstract-extractor';

interface extractedCommitment extends AbstractEntityData {
  txId: string;
  WID: string;
  commitment: string;
  eventId: string;
  rwtCount: string;
}

export { extractedCommitment };
