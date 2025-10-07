import { DataSource } from '@rosen-bridge/extended-typeorm';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { TokenMap } from '@rosen-bridge/tokens';
import { CardanoBlockFrostRosenExtractor } from '@rosen-bridge/rosen-extractor';
import { components } from '@blockfrost/openapi';
import { AbstractObservationExtractor } from '@rosen-bridge/abstract-observation-extractor';

interface BlockFrostTransaction {
  utxos: components['schemas']['tx_content_utxo'];
  metadata: components['schemas']['tx_content_metadata'];
}

export class CardanoBlockFrostObservationExtractor extends AbstractObservationExtractor<BlockFrostTransaction> {
  readonly FROM_CHAIN: string = 'cardano';

  constructor(
    lockAddress: string,
    dataSource: DataSource,
    tokens: TokenMap,
    logger?: AbstractLogger,
  ) {
    super(
      dataSource,
      tokens,
      new CardanoBlockFrostRosenExtractor(lockAddress, tokens, logger),
      logger,
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
