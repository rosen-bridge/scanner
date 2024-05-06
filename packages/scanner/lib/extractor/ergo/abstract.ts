import { DataSource } from 'typeorm';
import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';
import { V1 } from '@rosen-clients/ergo-explorer';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import JsonBigInt from '@rosen-bridge/json-bigint';

import { Transaction, OutputBox } from '../../scanner/ergo/network/types';
import { AbstractExtractor } from '../../interfaces';
import { AbstractErgoExtractorAction } from './abstractAction';
import { BlockEntity } from '../../entities/blockEntity';
import { ErgoExtractedData, SpendInfo } from '../interfaces';

export abstract class AbstractErgoExtractor<
  ExtractedData extends ErgoExtractedData
> extends AbstractExtractor<Transaction> {
  protected readonly dataSource: DataSource;
  protected actions: AbstractErgoExtractorAction<ExtractedData>;
  protected logger: AbstractLogger;
  readonly api;

  constructor(url: string, logger?: AbstractLogger) {
    super();
    this.api = ergoExplorerClientFactory(url);
    this.logger = logger ? logger : new DummyLogger();
  }

  /**
   * @return extracted data in proper format
   */
  abstract extractBoxData: (
    box: V1.OutputInfo | OutputBox,
    blockId: string,
    height: number
  ) => Omit<ExtractedData, 'spendBlock' | 'spendHeight'> | undefined;

  /**
   * @return true if the box has the required data and false otherwise
   */
  abstract hasData: (box: V1.OutputInfo | OutputBox) => boolean;

  /**
   * process a list of transactions and store Data box details
   *
   * @param {Transaction[]} txs list of transaction for block
   * @param {BlockEntity} block block id for transactions as hex encoded
   * @return {Promise<boolean>} Promise<boolean> if no error occurred return
   * true. otherwise, return false
   */
  processTransactions = async (
    txs: Transaction[],
    block: BlockEntity
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

        if (boxes.length > 0)
          await this.actions.insertBoxes(boxes, this.getId());
        await this.actions.spendBoxes(spentInfos, block, this.getId());
      }
    } catch (e) {
      this.logger.error(
        `Error in storing data in ${this.getId()} of the block ${block}: ${e}`
      );
      return false;
    }

    return true;
  };
}
