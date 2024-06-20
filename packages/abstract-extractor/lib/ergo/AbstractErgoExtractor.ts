import { DataSource } from 'typeorm';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import JsonBigInt from '@rosen-bridge/json-bigint';

import { AbstractExtractor } from '../AbstractExtractor';
import { AbstractErgoExtractorAction } from './AbstractErgoExtractorAction';
import { Block } from '../interfaces';
import {
  Transaction,
  OutputBox,
  ErgoExtractedData,
  SpendInfo,
} from './interfaces';

export abstract class AbstractErgoExtractor<
  ExtractedData extends ErgoExtractedData
> extends AbstractExtractor<Transaction> {
  protected readonly dataSource: DataSource;
  protected abstract actions: AbstractErgoExtractorAction<ExtractedData>;
  protected logger: AbstractLogger;

  constructor(logger = new DummyLogger()) {
    super();
    this.logger = logger;
  }

  /**
   * extract box data to proper format (not including spending information)
   * @param box
   * @param blockId box inclusion block hash
   * @param height box inclusion block height
   * @return extracted data in proper format
   */
  abstract extractBoxData: (
    box: OutputBox,
    blockId: string,
    height: number
  ) => Omit<ExtractedData, 'spendBlock' | 'spendHeight'> | undefined;

  /**
   * check proper data format in the box
   * @param box
   * @return true if the box has the required data and false otherwise
   */
  abstract hasData: (box: OutputBox) => boolean;

  /**
   * process a list of transactions in a block and store required information
   * @param txs list of transactions in the block
   * @param block
   * @return true if the process is completed successfully and false otherwise
   */
  processTransactions = async (
    txs: Transaction[],
    block: Block
  ): Promise<boolean> => {
    try {
      const boxes: Array<ExtractedData> = [];
      const spentInfos: Array<SpendInfo> = [];
      for (const tx of txs) {
        for (const output of tx.outputs) {
          if (!this.hasData(output)) {
            continue;
          }
          this.logger.debug(`Trying to extract data from box ${output.boxId}`);
          const extractedData = this.extractBoxData(
            output,
            block.hash,
            block.height
          );
          if (extractedData) {
            this.logger.debug(
              `Extracted data ${JsonBigInt.stringify(extractedData)} from box ${
                output.boxId
              }`
            );
            boxes.push(extractedData as ExtractedData);
          }
        }
        let boxIndex = 1;
        for (const input of tx.inputs) {
          spentInfos.push({ txId: tx.id, boxId: input.boxId, index: boxIndex });
          boxIndex += 1;
        }
      }

      if (boxes.length > 0) await this.actions.insertBoxes(boxes, this.getId());
      await this.actions.spendBoxes(spentInfos, block, this.getId());
    } catch (e) {
      this.logger.error(
        `Error in storing data in ${this.getId()} of the block ${block}: ${e}`
      );
      return false;
    }

    return true;
  };

  /**
   * fork one block and remove all stored information for this block
   * @param hash block hash
   */
  forkBlock = async (hash: string): Promise<void> => {
    await this.actions.deleteBlockBoxes(hash, this.getId());
  };
}
