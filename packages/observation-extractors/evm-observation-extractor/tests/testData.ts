import { JsonRpcProvider, Transaction, TransactionResponse } from 'ethers';

export const tx = Transaction.from({
  type: 2,
  to: '0xeDee4752e5a2F595151c94762fB38e5730357785',
  data: '0xa9059cbb0000000000000000000000004f0d2dde80b45e24ad4019a5aabd6c23aff2842b00000000000000000000000000000000000000000000000000000000e319aa30bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
  nonce: 53,
  gasLimit: '21000',
  gasPrice: null,
  maxPriorityFeePerGas: '500000000',
  maxFeePerGas: '48978500000',
  value: '0',
  chainId: '1',
  accessList: [],
  signature: {
    r: '0xc15a4d9e300114ed005a2821f01f4aa74dcfd3daf10749f26d8cc1bd8507673c',
    s: '0x090492307ff4c7d2d514f373fa8fb01212c6af83391b6aed7039a3c9d6ecad11',
    yParity: 0,
  },
  hash: '0x3b194eea7cf9507e745806265738ca19213be209885534161ec0fa9c232c9fea',
});
export const txRes = new TransactionResponse(tx as any, new JsonRpcProvider());

export const rosenData = {
  toChain: 'to-chain',
  toAddress: 'to-address',
  bridgeFee: '1968503938',
  networkFee: '9842520',
  fromAddress: 'from-address',
  sourceChainTokenId: 'source-token-id',
  amount: '3000000000',
  targetChainTokenId: 'target-token-id',
  sourceTxId:
    '0x3b194eea7cf9507e745806265738ca19213be209885534161ec0fa9c232c9fea',
};
