import { DataSource, In } from '@rosen-bridge/extended-typeorm';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import {
  AbstractInitializableErgoExtractorAction,
  BoxInfo,
  DB_CHUNK_SIZE,
  SpendInfo,
} from '@rosen-bridge/abstract-extractor';
import { BlockInfo } from '@rosen-bridge/scanner-interfaces';

import EventTriggerEntity from '../entities/EventTriggerEntity';
import { ExtractedEventTrigger } from '../interfaces/extractedEventTrigger';
import { JsonBI } from '../utils';
import { chunk, pick } from 'lodash-es';

class EventTriggerAction extends AbstractInitializableErgoExtractorAction<
  ExtractedEventTrigger,
  EventTriggerEntity
> {
  private readonly dataSource: DataSource;

  constructor(dataSource: DataSource, logger?: AbstractLogger) {
    super(dataSource, EventTriggerEntity, logger);
    this.dataSource = dataSource;
  }

  /**
   * create the box entity from extracted data and block information
   */
  createEntity = (
    triggerBoxes: ExtractedEventTrigger[],
    block: BlockInfo,
    extractor: string
  ): Omit<EventTriggerEntity, 'id'>[] => {
    return triggerBoxes.map((trigger) => ({
      txId: trigger.txId,
      eventId: trigger.eventId,
      boxId: trigger.boxId,
      serialized: trigger.serialized,
      block: block.hash,
      height: block.height,
      extractor: extractor,
      WIDsCount: trigger.WIDsCount,
      WIDsHash: trigger.WIDsHash,
      amount: trigger.amount,
      bridgeFee: trigger.bridgeFee,
      fromAddress: trigger.fromAddress,
      toAddress: trigger.toAddress,
      fromChain: trigger.fromChain,
      networkFee: trigger.networkFee,
      sourceChainTokenId: trigger.sourceChainTokenId,
      targetChainTokenId: trigger.targetChainTokenId,
      sourceBlockId: trigger.sourceBlockId,
      toChain: trigger.toChain,
      sourceTxId: trigger.sourceTxId,
      sourceChainHeight: trigger.sourceChainHeight,
    }));
  };

  /**
   * convert the database entity back to raw data
   */
  convertEntityToData = (
    entities: EventTriggerEntity[]
  ): ExtractedEventTrigger[] => {
    return entities.map((data) =>
      pick(data, [
        'eventId',
        'txId',
        'boxId',
        'serialized',
        'fromChain',
        'toChain',
        'fromAddress',
        'toAddress',
        'amount',
        'bridgeFee',
        'networkFee',
        'sourceChainTokenId',
        'targetChainTokenId',
        'sourceBlockId',
        'sourceTxId',
        'WIDsCount',
        'WIDsHash',
        'sourceChainHeight',
      ])
    );
  };

  /**
   * update spending information of stored event triggers
   * and set result and paymentTxId of the event
   * chunk spendInfos to prevent large database queries
   * @param spendInfArray
   * @param block
   * @param extractorId
   * @returns spent box ids
   */
  spendBoxes = async (
    spendInfoArray: Array<SpendInfo>,
    block: BlockInfo,
    extractorId: string
  ): Promise<BoxInfo[]> => {
    const spentData = [];
    const spendInfoChunks = chunk(spendInfoArray, DB_CHUNK_SIZE);
    for (const spendInfoChunk of spendInfoChunks) {
      const spentTriggers = await this.repository.findBy({
        boxId: In(spendInfoChunk.map((spendInfo) => spendInfo.boxId)),
        extractor: extractorId,
      });
      for (const spentTrigger of spentTriggers) {
        const spendInfo = spendInfoChunk.find(
          (info) => info.boxId === spentTrigger.boxId
        );
        if (!spendInfo || !spendInfo.extras || !spendInfo.extras.result) {
          throw Error(
            `Impossible case: spending information extras does not contain result, ${JsonBI.stringify(
              spendInfo
            )}`
          );
        }
        await this.repository.update(
          { boxId: spendInfo.boxId, extractor: extractorId },
          {
            spendBlock: block.hash,
            spendHeight: block.height,
            spendTxId: spendInfo.txId,
            result: spendInfo.extras.result,
            paymentTxId: spendInfo.extras.paymentTxId || '',
          }
        );
        spentData.push(pick(spendInfo, ['boxId']));
        this.logger.info(
          `Spent trigger [${spentTrigger.boxId}] of event [${spentTrigger.eventId}] at height ${block.height}`
        );
        this.logger.debug(
          `Spent trigger: [${JSON.stringify(
            spentTrigger
          )}] with spending information [${JsonBI.stringify(spendInfo)}]`
        );
      }
    }
    return spentData;
  };
}

export default EventTriggerAction;
