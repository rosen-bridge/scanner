interface ExtractedPermit {
  boxId: string;
  boxSerialized: string;
  WID: string;
  txId: string;
  block?: string;
  height?: number;
  spendBlock?: string;
  spendHeight?: number;
}

export { ExtractedPermit };
