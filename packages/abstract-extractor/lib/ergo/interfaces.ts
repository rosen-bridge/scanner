import {
  ErgoNetworkType,
  InputBox,
  OutputBox,
  Transaction,
} from '@rosen-bridge/scanner-interfaces';

export interface ExtendedTransaction extends Transaction {
  inclusionHeight: number;
  blockId: string;
  inputs: ExtendedInputBox[];
}

// Extended input boxes contain all data as an outputbox in network
// along with the spending proof and extension as an input box
type ExtendedInputBox = OutputBox & InputBox;

export interface SpendInfo {
  boxId: string;
  txId: string;
  index: number;
  extras?: { [key: string]: string };
}

export interface ExtendedSpendInfo extends SpendInfo {
  height: number;
  block: string;
}
export interface AbstractEntityData {
  identifier: string;
  serialized: string;
}

export enum CallbackType {
  Insert = 'insert',
  Update = 'update',
  Spend = 'spend',
  Delete = 'delete',
}

export interface EntityInfo {
  identifier: string;
}

export type CallbackDataMap<ExtractedData extends AbstractEntityData> = {
  [CallbackType.Update]: EntityInfo[];
  [CallbackType.Insert]: ExtractedData[];
  [CallbackType.Delete]: ExtractedData[];
  [CallbackType.Spend]: EntityInfo[];
};

export type CallbackMap<ExtractedData extends AbstractEntityData> = {
  [K in CallbackType]: (data: CallbackDataMap<ExtractedData>[K]) => void;
};

export type TxExtra = { [key: string]: string };

export interface RangeQuery {
  start: number;
  end: number;
  count: number;
}

/**
 * The range list is an array where each new range is a child of the previous
 * one. So, any range in the list supersedes all the ranges that come after it.
 * */
export type RangeList = RangeQuery[];

export interface InitializeOptions {
  active?: boolean;
  type: ErgoNetworkType;
  url: string;
  address: string;
  maxParallelRequests?: number;
}
