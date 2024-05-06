import { DataSource } from 'typeorm';
import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';
import { V1 } from '@rosen-clients/ergo-explorer';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import JsonBigInt from '@rosen-bridge/json-bigint';

import { Transaction, OutputBox } from '../../scanner/ergo/network/types';
import { AbstractExtractor } from '../../interfaces';
import { AbstractInitRequiredExtractorAction } from './abstractAction';
import { InitialInfo } from '../../interfaces';
import { ErgoExtractedData } from '../interfaces';
import { API_LIMIT } from '../../constants';

export abstract class AbstractInitRequiredErgoExtractor<
  ExtractedData extends ErgoExtractedData
> extends AbstractExtractor<Transaction> {
  protected readonly dataSource: DataSource;
  protected actions: AbstractInitRequiredExtractorAction<ExtractedData>;
  protected logger: AbstractLogger;
  readonly api;

  constructor(url: string, logger?: AbstractLogger) {
    super();
    this.api = ergoExplorerClientFactory(url);
    this.logger = logger ? logger : new DummyLogger();
  }

  /**
   * @returns explorer client data with specified limit and offset
   */
  abstract getBoxesWithOffsetLimit: (
    offset: number,
    limit: number
  ) => Promise<V1.ItemsOutputInfo>;

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
   * Return block information of specified tx
   * @param txId
   */
  getTxBlock = async (txId: string) => {
    const tx = await this.api.v1.getApiV1TransactionsP1(txId);
    return {
      id: tx.blockId,
      height: tx.inclusionHeight,
    };
  };

  /**
   * Return all related data below the initial height (including the init height)
   * @param initialHeight
   * @returns
   */
  findDataWithOffsetLimit = async (
    initialHeight: number,
    offset: number,
    limit: number
  ): Promise<{ extractedBoxes: Array<ExtractedData>; total: number }> => {
    const extractedBoxes: Array<ExtractedData> = [];
    const boxes = await this.getBoxesWithOffsetLimit(offset, limit);
    if (!boxes.items) {
      this.logger.warn('Explorer api output items should not be undefined.');
      throw new Error('Incorrect explorer api output');
    }
    const filteredBoxes = boxes.items.filter(
      (box: V1.OutputInfo) =>
        box.settlementHeight <= initialHeight && this.hasData(box)
    );
    for (const box of filteredBoxes) {
      const data = this.extractBoxData(box, box.blockId, box.settlementHeight);
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
          spendBlock = block.id;
          spendHeight = block.height;
        }
      }
      extractedBoxes.push({
        ...data,
        spendBlock,
        spendHeight,
      } as ExtractedData);
    }

    return { extractedBoxes, total: boxes.total };
  };

  /**
   * Initializes the database with older boxes related to the address
   */
  initializeBoxes = async (initialBlock: InitialInfo) => {
    this.logger.debug(
      `Initializing ${this.getId()} started, removing all existing data`
    );
    await this.actions.removeAllData(this.getId());

    let offset = 0;
    let total = 1;
    while (offset < total) {
      const data = await this.findDataWithOffsetLimit(
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

      total = data.total;
      offset += API_LIMIT;
    }
  };
}

export abstract class AbstractInitRequiredByAddressErgoExtractor<
  ExtractedData extends ErgoExtractedData
> extends AbstractInitRequiredErgoExtractor<ExtractedData> {
  protected address;

  constructor(url: string, address: string, logger?: AbstractLogger) {
    super(url, logger);
    this.address = address;
  }

  /**
   * Use explorer api to return related boxes by specified address
   * @param offset
   * @param limit
   * @returns related boxes
   */
  getBoxesWithOffsetLimit = async (
    offset: number,
    limit: number
  ): Promise<V1.ItemsOutputInfo> => {
    return await this.api.v1.getApiV1BoxesByaddressP1(this.address, {
      offset: offset,
      limit: limit,
    });
  };
}
