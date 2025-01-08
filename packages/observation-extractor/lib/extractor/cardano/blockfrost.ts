import { DataSource } from 'typeorm';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { TokenMap } from '@rosen-bridge/tokens';
import { CardanoBlockFrostRosenExtractor } from '@rosen-bridge/rosen-extractor';
import { components } from '@blockfrost/openapi';
import { AbstractObservationExtractor } from '../abstract/AbstractObservationExtractor';

interface BlockFrostTransaction {
  utxos: components['schemas']['tx_content_utxo'];
  metadata: components['schemas']['tx_content_metadata'];
}

export class CardanoBlockFrostObservationExtractor extends AbstractObservationExtractor<BlockFrostTransaction> {
  readonly FROM_CHAIN: string = 'cardano';

  constructor(
    dataSource: DataSource,
    tokens: TokenMap,
    address: string,
    logger?: AbstractLogger
  ) {
    super(
      dataSource,
      tokens,
      new CardanoBlockFrostRosenExtractor(address, tokens, logger),
      logger
    );
  }

  /**
   * get Id for current extractor
   */
  getId = () => 'cardano-blockfrost-extractor';

  /**
   * gets transaction id from TransactionType
   */
  getTxId = (tx: BlockFrostTransaction) => tx.utxos.hash;
}
