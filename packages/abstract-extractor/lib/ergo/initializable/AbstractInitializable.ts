import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import JsonBigInt from '@rosen-bridge/json-bigint';

import { ErgoBox, ErgoExtractedData } from '../interfaces';
import { API_LIMIT, RETRIAL_COUNT } from '../../constants';
import { AbstractErgoExtractor } from '../AbstractErgoExtractor';
import { AbstractInitializableErgoExtractorAction } from './AbstractInitializableAction';
import { BlockInfo } from '../../interfaces';

export abstract class AbstractInitializableErgoExtractor<
  ExtractedData extends ErgoExtractedData
> extends AbstractErgoExtractor<ExtractedData> {
  protected initialize: boolean;
  protected abstract actions: AbstractInitializableErgoExtractorAction<ExtractedData>;

  /**
   * create an initializable ergo extractor
   * @param initialize ignore the initialization step if its false
   * @param logger
   */
  constructor(initialize = true, logger?: AbstractLogger) {
    super(logger);
    this.initialize = initialize;
  }

  /**
   * return init required boxes with offset limit
   * @param offset
   * @param limit
   * @return boxes in batch
   */
  abstract getBoxesWithOffsetLimit: (
    offset: number,
    limit: number
  ) => Promise<{ boxes: ErgoBox[]; hasNextBatch: boolean }>;

  /**
   * return block information of specified tx
   * @param txId
   * @return block info
   */
  abstract getTxBlock: (txId: string) => Promise<BlockInfo>;

  /**
   * return all related data below the initial height (including the init height)
   * @param initialHeight
   * @return extracted data in batch
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
      (box: ErgoBox) =>
        box.inclusionHeight <= initialHeight && this.hasData(box)
    );
    for (const box of filteredBoxes) {
      const data = this.extractBoxData(box, box.blockId, box.inclusionHeight);
      if (!data) continue;
      const spent = box.spentHeight && box.spentHeight <= initialHeight;
      const extractedData = {
        ...data,
        spendBlock: spent ? box.spentBlockId : undefined,
        spendHeight: spent ? box.spentHeight : undefined,
      } as ExtractedData;
      this.logger.debug(
        `Extracted data ${JsonBigInt.stringify(extractedData)} from box ${
          box.boxId
        } in initialization phase`
      );
      extractedBoxes.push(extractedData);
    }
    return { extractedBoxes, hasNextBatch: apiOutput.hasNextBatch };
  };

  /**
   * initialize extractor database with data created below the initial height
   * ignore initialization if this feature is off
   * try to get data multiple times to pass accidental network problems
   * @param initialBlock
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
          const insertSuccess = await this.actions.insertBoxes(
            data.extractedBoxes,
            this.getId()
          );
          if (!insertSuccess) throw new Error('Could not store extracted data');

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
          this.logger.info(
            `Trying again to initialize ${this.getId()} with trial step ${trial}`
          );
        }
      }
    } else {
      this.logger.info(`Initialization for ${this.getId()} is turned off`);
    }
  };
}
