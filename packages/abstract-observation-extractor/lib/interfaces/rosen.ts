interface RosenData {
  toChain: string;
  toAddress: string;
  bridgeFee: string;
  networkFee: string;
  fromAddress: string;
  tokenId: string;
  amount: bigint;
}

interface CardanoRosenData {
  toChain: string;
  toAddress: string;
  bridgeFee: string;
  networkFee: string;
  fromAddress: string;
}

interface RawCardanoRosenData {
  to: string;
  networkFee: string;
  bridgeFee: string;
  toAddress: string;
  fromAddress: string[];
}

export { RosenData, CardanoRosenData, RawCardanoRosenData };
