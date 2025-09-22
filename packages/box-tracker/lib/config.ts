export type Asset = {
  tokenId: string;
  amount: bigint;
};

export type ApiRegister =
  | string
  | {
      serializedValue: string;
      sigmaType: string;
      renderedValue: string;
    };

export type AdditionalRegisters = Record<string, string>;

export type Token = {
  tokenId: string;
  amount: bigint;
};

export type ErgoBox = {
  boxId: string;
  value: bigint;
  ergoTree: string;
  creationHeight: number;
  assets: Array<Asset>;
  additionalRegisters: AdditionalRegisters;
  transactionId: string;
  index: number;
};

export type Transaction = {
  id: string;
  inputs: string[];
  outputs: ErgoBox[];
};
