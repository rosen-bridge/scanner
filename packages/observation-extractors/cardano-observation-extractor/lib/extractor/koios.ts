import { DataSource } from '@rosen-bridge/extended-typeorm';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { TokenMap } from '@rosen-bridge/tokens';
import { CardanoKoiosRosenExtractor } from '@rosen-bridge/rosen-extractor';
import { AbstractObservationExtractor } from '@rosen-bridge/abstract-observation-extractor';
import { KoiosTransaction } from '../interfaces/koiosTransaction';

export class CardanoKoiosObservationExtractor extends AbstractObservationExtractor<KoiosTransaction> {
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
      new CardanoKoiosRosenExtractor(lockAddress, tokens, logger),
      logger,
    );
  }

  /**
   * get Id for current extractor
   */
  getId = () => 'cardano-koios-extractor';

  /**
   * gets transaction id from TransactionType
   */
  getTxId = (tx: KoiosTransaction) => tx.tx_hash;

  /**
   * fork one block and remove all stored information for this block
   * @param hash: block hash
   */
  forkBlock = async (hash: string): Promise<void> => {
    await this.actions.deleteBlockObservation(hash, this.getId());
  };

  /**
   * Extractor box initialization
   * No action needed in cardano extractors
   */
  initializeBoxes = async () => {
    return;
  };
}
