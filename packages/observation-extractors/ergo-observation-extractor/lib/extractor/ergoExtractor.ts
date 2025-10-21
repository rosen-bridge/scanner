import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { AbstractObservationExtractor } from '@rosen-bridge/abstract-observation-extractor';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { ErgoNodeRosenExtractor } from '@rosen-bridge/rosen-extractor';
import { Block, Transaction } from '@rosen-bridge/scanner-interfaces';
import { TokenMap } from '@rosen-bridge/tokens';

import { NUMBER_OF_BLOCKS_PER_YEAR } from '../const';

export class ErgoObservationExtractor extends AbstractObservationExtractor<Transaction> {
  readonly FROM_CHAIN: string = 'ergo';

  constructor(
    lockAddress: string,
    dataSource: DataSource,
    tokens: TokenMap,
    logger?: AbstractLogger,
  ) {
    super(
      dataSource,
      tokens,
      new ErgoNodeRosenExtractor(lockAddress, tokens, logger),
      logger,
    );
  }

  /**
   * get Id for current extractor
   */
  getId = () => 'ergo-observation-extractor';

  /**
   * gets transaction id from TransactionType
   */
  getTxId = (tx: Transaction) => tx.id;

  /**
   * Filter transactions before processing
   */
  protected preprocessTransactions = (
    txs: Array<Transaction>,
    block: Block,
  ) => {
    return txs.filter((transaction) => {
      for (let i = 0; i < transaction.outputs.length; i++) {
        const box = transaction.outputs[i];
        if (
          block.height - Number(box.creationHeight) >
          NUMBER_OF_BLOCKS_PER_YEAR
        ) {
          this.logger.debug(
            `Skipping tx [${transaction.id}], box [${box.boxId}] creation_height [${box.creationHeight}] is more than a year ago [currentHeight: ${block.height}]`,
          );
          return false;
        }
      }
      return true;
    });
  };
}
