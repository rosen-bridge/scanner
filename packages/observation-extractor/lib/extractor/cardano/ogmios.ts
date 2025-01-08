import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { Transaction } from '@cardano-ogmios/schema';
import { DataSource } from 'typeorm';
import { RosenTokens, TokenMap } from '@rosen-bridge/tokens';
import { ObservationEntityAction } from '../../actions/db';
import { ExtractedObservation } from '../../interfaces/extractedObservation';
import { Buffer } from 'buffer';
import { blake2b } from 'blakejs';
import { CardanoOgmiosRosenExtractor } from '@rosen-bridge/rosen-extractor';
import { AbstractExtractor, Block } from '@rosen-bridge/abstract-extractor';
import { AbstractObservationExtractor } from '../abstract/AbstractObservationExtractor';

export class CardanoOgmiosObservationExtractor extends AbstractObservationExtractor<Transaction> {
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
      new CardanoOgmiosRosenExtractor(address, tokens, logger),
      logger
    );
  }

  /**
   * get Id for current extractor
   */
  getId = () => 'cardano-ogmios-extractor';

  /**
   * gets transaction id from TransactionType
   */
  getTxId = (tx: Transaction) => tx.id;
}
