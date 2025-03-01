export enum ErgoNetworkType {
  Explorer = 'explorer',
  Node = 'node',
}

export type InputExtension = {
  [key: string]: string;
};

export type InputBox = {
  boxId: string;
  extension?: InputExtension;
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
  assets: Array<Asset>;
  additionalRegisters: AdditionalRegisters;
  transactionId: string;
  index: number;
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

export interface ExtendedTransaction extends Transaction {
  inclusionHeight: number;
  blockId: string;
}

export interface SpendInfo {
  boxId: string;
  txId: string;
  index: number;
  extras?: string[];
}

export interface AbstractBoxData {
  boxId: string;
  serialized: string;
}

export enum CallbackType {
  Insert = 'insert',
  Update = 'update',
  Spend = 'spend',
  Delete = 'delete',
}

export interface BoxInfo {
  boxId: string;
}

export type CallbackDataMap<ExtractedData extends AbstractBoxData> = {
  [CallbackType.Update]: BoxInfo[];
  [CallbackType.Insert]: ExtractedData[];
  [CallbackType.Delete]: ExtractedData[];
  [CallbackType.Spend]: BoxInfo[];
};

export type CallbackMap<ExtractedData extends AbstractBoxData> = {
  [K in CallbackType]: (data: CallbackDataMap<ExtractedData>[K]) => void;
};
