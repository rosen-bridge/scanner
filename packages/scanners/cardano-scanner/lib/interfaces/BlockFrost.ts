import { components } from '@blockfrost/openapi';

export class BlockFrostNullValueError extends Error {
  constructor(msg: string) {
    super('BlockFrostNullValueError: ' + msg);
  }
}

export interface BlockFrostTransaction {
  utxos: components['schemas']['tx_content_utxo'];
  metadata: components['schemas']['tx_content_metadata'];
}
