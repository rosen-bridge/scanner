interface ExtractedFraud {
  boxId: string;
  serialized: string;
  triggerBoxId: string;
  wid: string;
  blockId?: string;
  height?: number;
  spendBlock?: string;
  spendHeight?: number;
}

export { ExtractedFraud };
