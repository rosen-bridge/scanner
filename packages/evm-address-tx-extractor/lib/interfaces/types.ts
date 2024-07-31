export interface ExtractedTx {
  unsignedHash: string;
  signedHash: string;
  nonce: number;
  address: string;
  status: EvmTxStatus;
}

export enum EvmTxStatus {
  failed = 'failed',
  succeed = 'succeed',
}
