import { AbstractEntityData } from '@rosen-bridge/abstract-extractor';

interface ExtractedPermit extends AbstractEntityData {
  WID: string;
  txId: string;
  spendBlock?: string | null;
  spendHeight?: number | null;
}

export { ExtractedPermit };
