import { Block, Transaction } from '@cardano-ogmios/schema';

export const cardanoSampleObservation = {
  id: 1,
  sourceTxId: 'tx123',
  height: 51,
  fromChain: 'cardano',
  toChain: 'ergo',
  fromAddress: 'addr-1',
  toAddress: 'addr-2',
  amount: '10000000',
  networkFee: '1500000',
  bridgeFee: '10000',
  sourceChainTokenId: 'ada',
  targetChainTokenId: 'mocked-bridged-ada-id',
  sourceBlockId: 'block-100',
  requestId: '123',
  block: 'block-200',
  extractor: 'cardano-ogmios-observation-extractor',
  rawData: '',
};
export const cardanoSampleObservation2 = {
  id: 2,
  sourceTxId: 'not-exist',
  height: 51,
  fromChain: 'cardano',
  toChain: 'ergo',
  fromAddress: 'addr-1',
  toAddress: 'addr-2',
  amount: '10000000',
  networkFee: '1500000',
  bridgeFee: '10000',
  sourceChainTokenId: 'ada',
  targetChainTokenId: 'mocked-bridged-ada-id',
  sourceBlockId: 'block-100',
  requestId: '123',
  block: 'block-200',
  extractor: 'cardano-ogmios-observation-extractor',
  rawData: '',
};
export const cardanoSampleTx = {
  id: 'tx123',
  body: { foo: 1 },
  spends: '',
  inputs: [],
  outputs: [],
  signatories: [],
};
export const cardanoSampleBlock: Block = {
  type: 'praos',
  transactions: [cardanoSampleTx as Transaction],
  era: 'mary',
  id: '',
  ancestor: '',
  height: 51,
  size: { bytes: 1 },
  slot: 1,
  protocol: { version: { major: 0, minor: 1 } },
  issuer: {
    verificationKey: '',
    vrfVerificationKey: '',
    operationalCertificate: {
      count: 1,
      kes: {
        period: 1,
        verificationKey: '',
      },
    },
    leaderValue: {},
  },
};
export const cardanoSampleIntersection = { slot: 100, id: 'abc' };
