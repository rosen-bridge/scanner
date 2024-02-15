import { ExtractedEventTrigger } from '../../lib/interfaces/extractedEventTrigger';

export const sampleEventEntity = {
  txId: 'txId',
  eventId: 'eventId',
  extractor: 'extractorId',
  boxId: 'id',
  boxSerialized: 'boxSerialized',
  block: 'hash',
  height: 10,
  toAddress: 'cardanoAddr2',
  fromChain: 'ergo',
  toChain: 'cardano',
  fromAddress: 'address',
  amount: '17',
  bridgeFee: '34',
  networkFee: '51',
  sourceChainTokenId: 'sourceToken',
  targetChainTokenId: 'targetToken',
  sourceTxId: 'txId',
  sourceBlockId: 'blockId',
  WIDsCount: 0,
  WIDsHash: '',
  sourceChainHeight: 10,
};

export const sampleEventTrigger1: ExtractedEventTrigger = {
  eventId: 'eventId',
  txId: 'txId2',
  WIDsCount: 1,
  WIDsHash: 'hash1',
  amount: '22',
  bridgeFee: '11',
  fromAddress: 'ergoAddress1',
  fromChain: 'ergo',
  networkFee: '88',
  sourceChainTokenId: 'tokenId2',
  targetChainTokenId: 'asset2',
  sourceTxId: 'txId2',
  toAddress: 'addr4',
  toChain: 'cardano',
  boxId: '1',
  boxSerialized: 'serialized1',
  sourceBlockId: 'blockId',
  sourceChainHeight: 10,
};

export const sampleEventTrigger2: ExtractedEventTrigger = {
  eventId: 'eventId',
  txId: 'txId',
  WIDsCount: 1,
  WIDsHash: 'hash2',
  amount: '100',
  bridgeFee: '10',
  fromAddress: 'address',
  fromChain: 'ergo',
  networkFee: '1000',
  sourceChainTokenId: 'tokenId1',
  targetChainTokenId: 'asset1',
  sourceTxId: 'txId1',
  toAddress: 'addr1',
  toChain: 'cardano',
  boxId: '2',
  boxSerialized: 'serialized2',
  sourceBlockId: 'blockId',
  sourceChainHeight: 20,
};

export const sampleEventTrigger3: ExtractedEventTrigger = {
  ...sampleEventTrigger1,
  boxId: '3',
};

export const sampleEventTrigger4: ExtractedEventTrigger = {
  ...sampleEventTrigger2,
  boxId: '4',
};
