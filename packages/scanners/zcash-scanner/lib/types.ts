import type { AxiosBasicCredentials } from '@rosen-clients/rate-limited-axios';

export interface ZcashRpcNetworkConfig {
  rpcUrl: string;
  expectedGenesisHash: string;
  timeoutMs?: number;
  auth?: AxiosBasicCredentials;
}

export type ZcashRpcTransaction = Record<string, unknown> & {
  txid: string;
  hex: string;
  size: number;
  blockhash: string;
  height: number;
};

export interface ValidatedZcashBlock {
  hash: string;
  previousblockhash: string;
  height: number;
  time: number;
  nTx: number;
  tx: ZcashRpcTransaction[];
}
