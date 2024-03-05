type Asset = {
  tokenId: string;
  index: number;
  amount: bigint;
  name: string;
};

export interface ErgoBoxJson {
  boxId: string;
  address: string;
  value: bigint;
  blockId: string;
  settlementHeight: number;
  assets: Array<Asset>;
}

export interface AddressBoxes {
  items: Array<ErgoBoxJson>;
  total: number;
}

export interface SpendInfo {
  boxId: string;
  txId: string;
  index?: number;
}
