import { AbstractEntityData } from '@rosen-bridge/abstract-extractor';
import { ErgoNetworkType } from '@rosen-bridge/scanner-interfaces';

export interface ExtractedRewardData extends AbstractEntityData {
  block: string;
  height: number;
  tokenId: string;
  bridgeFee: bigint;
  networkFee: bigint;
  emissionTokenId: string;
  guardsEmission: bigint;
  watchersEmission: bigint;
  rewardedWIDsCount: number;
  rewardedWIDs: string;
  extractor: string;
}

export interface RewardInitializeOptions {
  active?: boolean;
  type: ErgoNetworkType;
  url: string;
  address: string;
  maxParallelRequests?: number;
}

export interface RewardAddresses {
  networkFeeAddresses: string[];
  guardEmissionAddresses: string[];
  permitAddresses: string[];
}
