import { DataSource } from 'typeorm';
import * as wasm from 'ergo-lib-wasm-nodejs';
import { blake2b } from 'blakejs';
import { Transaction } from '@rosen-bridge/scanner';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import {
  AbstractInitializableErgoExtractor,
  BlockInfo,
  ErgoNetworkType,
  OutputBox,
  SpendInfo,
} from '@rosen-bridge/abstract-extractor';

import EventTriggerAction from '../actions/EventTriggerAction';
import { ExtractedEventTrigger } from '../interfaces/extractedEventTrigger';
import { JsonBI } from '../utils';
import { EventResult } from '../types';

class EventTriggerExtractor extends AbstractInitializableErgoExtractor<ExtractedEventTrigger> {
  id: string;
  protected readonly actions: EventTriggerAction;
  private readonly eventTriggerErgoTree: string;
  private readonly permitErgoTree: string;
  private readonly fraudErgoTree: string;
  private readonly RWT: string;

  constructor(
    id: string,
    dataSource: DataSource,
    type: ErgoNetworkType,
    url: string,
    address: string,
    RWT: string,
    permitAddress: string,
    fraudAddress: string,
    logger?: AbstractLogger
  ) {
    super(type, url, address, logger);
    this.id = id;
    this.eventTriggerErgoTree = wasm.Address.from_base58(address)
      .to_ergo_tree()
      .to_base16_bytes();
    this.permitErgoTree = wasm.Address.from_base58(permitAddress)
      .to_ergo_tree()
      .to_base16_bytes();
    this.fraudErgoTree = wasm.Address.from_base58(fraudAddress)
      .to_ergo_tree()
      .to_base16_bytes();
    this.RWT = RWT;
    this.actions = new EventTriggerAction(dataSource, this.logger);
  }

  /**
   * get Id for current extractor
   */
  getId = () => this.id;

  /**
   * check proper data format in the box
   *  - box ergoTree
   *  - RWT in first token place
   *  - widListHash in R4
   *  - event data in R5
   *  - widCount in R7
   * @param box
   * @return true if the box has the required data and false otherwise
   */
  hasData = (box: OutputBox): boolean => {
    try {
      const parsedBox = wasm.ErgoBox.from_json(JsonBI.stringify(box));
      if (
        box.additionalRegisters &&
        box.additionalRegisters.R4 &&
        box.additionalRegisters.R5 &&
        box.additionalRegisters.R7 &&
        parsedBox.register_value(wasm.NonMandatoryRegisterId.R4) &&
        parsedBox.register_value(wasm.NonMandatoryRegisterId.R5) &&
        parsedBox.register_value(wasm.NonMandatoryRegisterId.R7) &&
        box.assets &&
        box.assets.length > 0 &&
        box.assets[0].tokenId === this.RWT &&
        box.ergoTree === this.eventTriggerErgoTree
      ) {
        const R4Serialized = parsedBox
          .register_value(wasm.NonMandatoryRegisterId.R4)!
          .to_byte_array();
        const R5Serialized = parsedBox
          .register_value(wasm.NonMandatoryRegisterId.R5)!
          .to_coll_coll_byte();
        if (R4Serialized.length >= 1 && R5Serialized.length >= 12) return true;
      }
    } catch (e) {
      this.logger.warn(
        `Unexpected error occurred while checking the proper trigger data format for box ${box.boxId}: ${e}`
      );
    }
    return false;
  };

  /**
   * extract box data to proper format (not including spending information)
   * @param box
   * @return extracted data in proper format
   */
  extractBoxData = (
    box: OutputBox
  ): Omit<ExtractedEventTrigger, 'spendBlock' | 'spendHeight'> | undefined => {
    try {
      const parsedBox = wasm.ErgoBox.from_json(JsonBI.stringify(box));
      const R4Serialized = parsedBox
        .register_value(wasm.NonMandatoryRegisterId.R4)!
        .to_byte_array();
      const R5Serialized = parsedBox
        .register_value(wasm.NonMandatoryRegisterId.R5)!
        .to_coll_coll_byte();

      const WIDsCount = parsedBox
        .register_value(wasm.NonMandatoryRegisterId.R7)!
        .to_i32();
      const WIDsHash = Buffer.from(R4Serialized).toString('hex');
      const sourceTxId = Buffer.from(R5Serialized[0]).toString();
      const eventId = Buffer.from(blake2b(sourceTxId, undefined, 32)).toString(
        'hex'
      );
      return {
        eventId: eventId,
        txId: box.transactionId,
        boxId: box.boxId,
        boxSerialized: Buffer.from(parsedBox.sigma_serialize_bytes()).toString(
          'base64'
        ),
        toChain: Buffer.from(R5Serialized[2]).toString(),
        toAddress: Buffer.from(R5Serialized[4]).toString(),
        networkFee: BigInt(
          '0x' + Buffer.from(R5Serialized[7]).toString('hex')
        ).toString(10),
        bridgeFee: BigInt(
          '0x' + Buffer.from(R5Serialized[6]).toString('hex')
        ).toString(10),
        amount: BigInt(
          '0x' + Buffer.from(R5Serialized[5]).toString('hex')
        ).toString(10),
        sourceChainTokenId: Buffer.from(R5Serialized[8]).toString(),
        targetChainTokenId: Buffer.from(R5Serialized[9]).toString(),
        sourceTxId: sourceTxId,
        fromChain: Buffer.from(R5Serialized[1]).toString(),
        fromAddress: Buffer.from(R5Serialized[3]).toString(),
        sourceBlockId: Buffer.from(R5Serialized[10]).toString(),
        WIDsCount: WIDsCount,
        WIDsHash: WIDsHash,
        sourceChainHeight: Number(
          BigInt('0x' + Buffer.from(R5Serialized[11]).toString('hex')).toString(
            10
          )
        ),
      };
    } catch (e) {
      this.logger.warn(
        `Unexpected error occurred while extracting trigger data for box ${box.boxId}: ${e}`
      );
      return undefined;
    }
  };

  /**
   * gets block id and transactions corresponding to the block and saves if they are valid rosen
   *  transactions and in case of success return true and in case of failure returns false
   * @param block
   * @param txs
   */
  processTransactions = async (
    txs: Array<Transaction>,
    block: BlockInfo
  ): Promise<boolean> => {
    try {
      const boxes: Array<ExtractedEventTrigger> = [];
      const spendInfoArray: Array<SpendInfo> = [];
      txs.forEach((transaction) => {
        // extract event result
        const { result, paymentTxId } = this.extractEventResult(transaction);
        for (const output of transaction.outputs) {
          // extract output box data
          if (this.hasData(output)) {
            this.logger.debug(
              `Trying to extract data from box ${output.boxId} at height ${block.height}`
            );
            const data = this.extractBoxData(output);
            if (data) {
              this.logger.debug(
                `Extracted data ${JsonBI.stringify(data)} from box ${
                  output.boxId
                }`
              );
              boxes.push(data);
            }
          }
        }
        // process inputs
        for (let index = 0; index < transaction.inputs.length; index++)
          spendInfoArray.push({
            txId: transaction.id,
            boxId: transaction.inputs[index].boxId,
            index: index,
            extras: [result, paymentTxId],
          });
      });
      if (boxes.length > 0)
        await this.actions.insertBoxes(boxes, block, this.getId());
      await this.actions.spendBoxes(spendInfoArray, block, this.id);
    } catch (e) {
      this.logger.error(
        `Error in storing data in ${this.getId()} of the block ${block}: ${e}`
      );
      return false;
    }
    return true;
  };

  /**
   * extracts result and paymentTxId from a transaction
   * returns 'unknown' as result when tx is neither fraud or successful
   * @param transaction
   * @returns
   */
  protected extractEventResult = (transaction: Transaction) => {
    let result = EventResult.unknown;
    let paymentTxId = '';
    if (transaction.outputs[0].ergoTree === this.fraudErgoTree)
      result = EventResult.fraud;
    else if (transaction.outputs[0].ergoTree === this.permitErgoTree) {
      result = EventResult.successful;
      // find first non-watcher box with R4 value
      for (const box of transaction.outputs) {
        // if it's watcher box, skip it
        if (box.ergoTree === this.permitErgoTree) continue;
        const outputParsed = wasm.ErgoBox.from_json(JsonBI.stringify(box));
        try {
          const R4Serialized = outputParsed
            .register_value(wasm.NonMandatoryRegisterId.R4)
            ?.to_byte_array();
          if (R4Serialized !== undefined && R4Serialized.length > 0) {
            let txId = Buffer.from(R4Serialized).toString();
            // we assumed txId only includes these characters
            if (!txId.match(/^[0-9a-zA-Z\-_.]+$/)) {
              // backward compatibility
              txId = Buffer.from(R4Serialized).toString('hex');
            }
            paymentTxId = txId;
            if (txId === '') {
              paymentTxId = transaction.id;
              this.logger.debug(
                `successful event is spent. tx [${transaction.id}] is both payment and reward distribution tx`
              );
            }
            // paymentTxId is extracted. no need to process next boxes
            break;
          }
        } catch (e) {
          continue;
        }
      }
    }
    return {
      result,
      paymentTxId,
    };
  };
}

export default EventTriggerExtractor;
