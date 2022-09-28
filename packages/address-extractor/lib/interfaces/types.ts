type Asset = {
  tokenId: string;
  index: number;
  amount: bigint;
};

export interface ErgoBoxJson {
  boxId: string;
  address: string;
  value: bigint;
  blockId: string;
  settlementHeight: number;
  assets?: Array<Asset>;
}

export interface AddressBoxes {
  items: Array<ErgoBoxJson>;
  total: number;
}
