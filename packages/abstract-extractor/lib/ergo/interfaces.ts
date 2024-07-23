export enum ErgoNetworkType {
  Explorer = 'explorer',
  Node = 'node',
}

export type InputBox = {
  boxId: string;
};

export type DataInput = {
  boxId: string;
};

export type Asset = {
  tokenId: string;
  amount: bigint;
};

export type AdditionalRegisters = {
  R4?: string;
  R5?: string;
  R6?: string;
  R7?: string;
  R8?: string;
  R9?: string;
};

export type OutputBox = {
  boxId: string;
  value: bigint;
  ergoTree: string;
  creationHeight: number;
  assets?: Array<Asset>;
  additionalRegisters?: AdditionalRegisters;
  transactionId: string;
  index: bigint | number;
};

export interface ErgoBox extends OutputBox {
  blockId: string;
  inclusionHeight: number;
  spentBlockId?: string;
  spentHeight?: number;
  spentTransactionId?: string;
  spentIndex?: number;
}

export type Transaction = {
  id: string;
  inputs: Array<InputBox>;
  dataInputs: Array<DataInput>;
  outputs: Array<OutputBox>;
  size?: bigint;
};

export interface SpendInfo {
  boxId: string;
  txId: string;
  index: number;
}

export interface ErgoExtractedData {
  boxId: string;
  height: number;
  blockId: string;
  spendBlock?: string;
  spendHeight?: number;
  spendTxId?: string;
  spendIndex?: number;
}
