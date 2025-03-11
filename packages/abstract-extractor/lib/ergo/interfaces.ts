import { OutputBox, Transaction } from '@rosen-bridge/scanner-interfaces';

export interface ErgoBox extends OutputBox {
  blockId: string;
  inclusionHeight: number;
  spentBlockId?: string;
  spentHeight?: number;
  spentTransactionId?: string;
  spentIndex?: number;
}

export interface ExtendedTransaction extends Transaction {
  inclusionHeight: number;
  blockId: string;
}

export interface SpendInfo {
  boxId: string;
  txId: string;
  index: number;
  extras?: { [key: string]: string };
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

export type TxExtra = { [key: string]: string };
