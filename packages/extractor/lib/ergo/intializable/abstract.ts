import { V1 } from '@rosen-clients/ergo-explorer';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import JsonBigInt from '@rosen-bridge/json-bigint';

import {
  OutputBox,
  ErgoBox,
  BlockInfo,
  ErgoExtractedData,
} from '../../interfaces';
import { API_LIMIT } from '../../constants';
import { AbstractErgoExtractor } from '../abstract';
import { AbstractInitializableErgoExtractorAction } from '../abstractAction';

export abstract class AbstractInitializableErgoExtractor<
  ExtractedData extends ErgoExtractedData
> extends AbstractErgoExtractor<ExtractedData> {
  protected logger: AbstractLogger;
  protected initialize: boolean;
  protected abstract actions: AbstractInitializableErgoExtractorAction<ExtractedData>;

  constructor(initialize = true, logger = new DummyLogger()) {
    super(logger);
    this.initialize = initialize;
    this.logger = logger;
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
  ) => Promise<ErgoBox[]>;

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
    const boxes = await this.getBoxesWithOffsetLimit(offset, limit);

    const filteredBoxes = boxes.filter(
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
    return { extractedBoxes, hasNextBatch: boxes.length > 0 };
  };

  /**insertBoxes
   * Initializes the database with older boxes related to the address
   */
  initializeBoxes = async (initialBlock: BlockInfo) => {
    this.logger.debug(
      `Initializing ${this.getId()} started, removing all existing data`
    );
    await this.actions.removeAllData(this.getId());

    let hasNextBatch = true;
    let offset = 0;
    while (hasNextBatch) {
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
    }
  };
}
