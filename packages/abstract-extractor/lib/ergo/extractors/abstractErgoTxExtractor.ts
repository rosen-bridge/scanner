import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import JsonBigInt from '@rosen-bridge/json-bigint';
import { Transaction, BlockInfo } from '@rosen-bridge/scanner-interfaces';

import { AbstractEntityData, CallbackType } from '../interfaces';
import { AbstractErgoEntity } from '../database/entities/abstractErgoEntity';
import { AbstractErgoExtractor } from './abstractErgoExtractor';
import { AbstractErgoAction } from '../database/actions/abstractErgoAction';

export abstract class AbstractErgoTxExtractor<
  ExtractedData extends AbstractEntityData,
  ExtractorEntity extends AbstractErgoEntity,
> extends AbstractErgoExtractor<ExtractedData, ExtractorEntity> {
  protected abstract actions: AbstractErgoAction<
    ExtractedData,
    ExtractorEntity
  >;

  constructor(logger: AbstractLogger) {
    super(logger);
    this.logger = logger;
  }

  /**
   * extract tx data to proper format (not including spending information)
   * @param tx
   * @return extracted data in proper format
   */
  abstract extractTxData: (tx: Transaction) => ExtractedData | undefined;

  /**
   * check proper data format in the tx
   * @param tx
   * @return true if the tx has the required data and false otherwise
   */
  abstract hasData: (tx: Transaction) => boolean;

  /**
   * process a list of transactions in a block and store required information
   * @param txs list of transactions in the block
   * @param block
   * @return true if the process is completed successfully and false otherwise
   */
  processTransactions = async (
    txs: Transaction[],
    block: BlockInfo,
  ): Promise<boolean> => {
    try {
      const txsData: Array<ExtractedData> = [];
      for (const tx of txs) {
        if (!this.hasData(tx)) {
          continue;
        }
        this.logger.debug(`Trying to extract data from tx ${tx.id}`);
        const extractedData = this.extractTxData(tx);
        if (extractedData) {
          this.logger.debug(
            `Extracted data ${JsonBigInt.stringify(extractedData)} from tx ${
              tx.id
            }`,
          );
          txsData.push(extractedData);
        }
      }

      if (txsData.length > 0) {
        if (!(await this.actions.storeEntities(txsData, block, this.getId()))) {
          this.logger.warn(
            `Data insertion failed for ${this.getId()} at the block ${
              block.height
            }`,
          );
          return false;
        }
        this.triggerCallbacks(CallbackType.Insert, txsData);
      }
    } catch (e) {
      this.logger.error(
        `Processing transactions failed for ${this.getId()} at the block ${
          block.height
        } with error: ${e}`,
      );
      return false;
    }
    return true;
  };
}
