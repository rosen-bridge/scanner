import { ObservationEntity } from '../../lib';

export const tx = {
  txId: 'tx-id',
};

export const rosenData = {
  toChain: 'to-chain',
  toAddress: 'to-address',
  bridgeFee: '1968503938',
  networkFee: '9842520',
  fromAddress: 'from-address',
  sourceChainTokenId: 'source-token-id',
  amount: '3000000000',
  targetChainTokenId: 'target-token-id',
  sourceTxId: 'tx-id',
  rawData: 'mocked',
};

export const observationEntity1: ObservationEntity = {
  id: 1,
  fromChain: 'fromChain1',
  toChain: rosenData.toChain,
  fromAddress: rosenData.fromAddress,
  toAddress: rosenData.toAddress,
  height: 1,
  amount: rosenData.amount,
  networkFee: rosenData.networkFee,
  bridgeFee: rosenData.bridgeFee,
  sourceChainTokenId: rosenData.sourceChainTokenId,
  targetChainTokenId: rosenData.targetChainTokenId,
  sourceBlockId: 'sourceBlockId1',
  sourceTxId: 'sourceTxId1',
  block: 'block1',
  requestId: 'requestId1',
  extractor: 'extractor1',
  rawData: 'mocked1',
};

export const observationEntity2: ObservationEntity = {
  id: 2,
  fromChain: 'fromChain2',
  toChain: rosenData.toChain,
  fromAddress: rosenData.fromAddress,
  toAddress: rosenData.toAddress,
  height: 2,
  amount: rosenData.amount,
  networkFee: rosenData.networkFee,
  bridgeFee: rosenData.bridgeFee,
  sourceChainTokenId: rosenData.sourceChainTokenId,
  targetChainTokenId: rosenData.targetChainTokenId,
  sourceBlockId: 'sourceBlockId2',
  sourceTxId: 'sourceTxId2',
  block: 'block2',
  requestId: 'requestId2',
  extractor: 'extractor2',
  rawData: 'mocked2',
};
