import { V1 } from '@rosen-clients/ergo-explorer';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import JsonBigInt from '@rosen-bridge/json-bigint';

import { OutputBox, ErgoBox, ErgoExtractedData } from '../interfaces';
import { API_LIMIT, RETRIAL_COUNT } from '../../constants';
import { AbstractErgoExtractor } from '../abstract';
import { AbstractInitializableErgoExtractorAction } from './abstractAction';
import { BlockInfo } from '../../interfaces';

export abstract class AbstractInitializableErgoExtractor<
  ExtractedData extends ErgoExtractedData
> extends AbstractErgoExtractor<ExtractedData> {
  protected initialize: boolean;
  protected abstract actions: AbstractInitializableErgoExtractorAction<ExtractedData>;

  constructor(initialize = true, logger?: AbstractLogger) {
    super(logger);
    this.initialize = initialize;
  }

  /**
   * @return true if the box has the required data and false otherwise
   */
  abstract hasData: (box: V1.OutputInfo | OutputBox) => boolean;

  /**
   * @returns explorer client data with specified limit and offset
   */
  abstract getBoxesWithOffsetLimit: (
    offset: number,
    limit: number
  ) => Promise<{ boxes: ErgoBox[]; hasNextBatch: boolean }>;

  /**
   * Return block information of specified tx
   * @param txId
   */
  abstract getTxBlock: (txId: string) => Promise<BlockInfo>;

  /**
   * Return all related data below the initial height (including the init height)
   * @param initialHeight
   * @returns
   */
  fetchDataWithOffsetLimit = async (
    initialHeight: number,
    offset: number,
    limit: number
  ): Promise<{
    extractedBoxes: Array<ExtractedData>;
    hasNextBatch: boolean;
  }> => {
    const extractedBoxes: Array<ExtractedData> = [];
    const apiOutput = await this.getBoxesWithOffsetLimit(offset, limit);

    const filteredBoxes = apiOutput.boxes.filter(
      (box: ErgoBox) => box.creationHeight <= initialHeight && this.hasData(box)
    );
    for (const box of filteredBoxes) {
      // const block = await this.getTxBlock(box.transactionId);
      const data = this.extractBoxData(box, box.blockId, box.creationHeight);
      if (!data) continue;
      this.logger.debug(
        `Extracted data ${JsonBigInt.stringify(extractedBoxes)} from box ${
          box.boxId
        }`
      );
      let spendBlock, spendHeight;
      if (box.spentTransactionId) {
        const block = await this.getTxBlock(box.spentTransactionId);
        if (block.height <= initialHeight) {
          this.logger.debug(
            `Box with id ${box.boxId} spent at block ${block} bellow the initial height`
          );
          spendBlock = block.hash;
          spendHeight = block.height;
        }
      }
      extractedBoxes.push({
        ...data,
        spendBlock,
        spendHeight,
      } as ExtractedData);
    }
    return { extractedBoxes, hasNextBatch: apiOutput.hasNextBatch };
  };

  /**insertBoxes
   * Initializes the database with older boxes related to the address
   */
  initializeBoxes = async (initialBlock: BlockInfo) => {
    let trial = 1;
    if (this.initialize) {
      this.logger.debug(
        `Initializing ${this.getId()} started, removing all existing data`
      );
      await this.actions.removeAllData(this.getId());

      let hasNextBatch = true;
      let offset = 0;
      while (hasNextBatch) {
        try {
          const data = await this.fetchDataWithOffsetLimit(
            initialBlock.height,
            offset,
            API_LIMIT
          );
          this.logger.info(
            `Inserting ${
              data.extractedBoxes.length
            } new extracted data in ${this.getId()} initialization`
          );
          await this.actions.insertBoxes(data.extractedBoxes, this.getId());

          hasNextBatch = data.hasNextBatch;
          offset += API_LIMIT;
        } catch (e) {
          this.logger.warn(
            `Initialization for ${this.getId()} failed with error :${e}`
          );
          if (trial == RETRIAL_COUNT)
            throw Error(
              `Initialization for ${this.getId()} failed after ${RETRIAL_COUNT} retrial`
            );
          trial += 1;
          this.logger.debug(
            `Trying again to initialize ${this.getId()} with trial step ${trial}`
          );
        }
      }
    } else {
      this.logger.info(`Initialization for ${this.getId()} is turned off`);
    }
  };
}
