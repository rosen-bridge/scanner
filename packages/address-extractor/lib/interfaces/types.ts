type Asset = {
  tokenId: string;
  index: number;
  amount: bigint;
};

interface ErgoBoxJson {
  boxId: string;
  address: string;
  value: bigint;
  blockId: string;
  settlementHeight: number;
  assets: Array<Asset>;
}

interface Boxes {
  items: Array<ErgoBoxJson>;
  total: number;
}

interface ExtractedBox {
  boxId: string;
  address: string;
  serialized: string;
  blockId?: string;
  height?: number;
  spendBlock?: string;
  spendHeight?: number;
}

export { ErgoBoxJson, Boxes, ExtractedBox };
