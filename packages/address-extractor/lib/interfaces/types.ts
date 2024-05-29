export interface ExtractedBox {
  boxId: string;
  address: string;
  serialized: string;
  blockId: string;
  height: number;
  spendBlock?: string;
  spendHeight?: number;
}
