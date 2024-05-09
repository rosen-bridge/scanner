import { DataSource } from 'typeorm';
import * as wasm from 'ergo-lib-wasm-nodejs';
import { blake2b } from 'blakejs';
import { Transaction } from '@rosen-bridge/scanner';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { AbstractExtractor, Block } from '@rosen-bridge/extractor';

import EventTriggerAction from '../actions/EventTriggerAction';
import { ExtractedEventTrigger } from '../interfaces/extractedEventTrigger';
import { JsonBI } from '../utils';
import { EventResult } from '../types';

class EventTriggerExtractor extends AbstractExtractor<Transaction> {
  readonly logger: AbstractLogger;
  id: string;
  private readonly dataSource: DataSource;
  private readonly actions: EventTriggerAction;
  private readonly eventTriggerErgoTree: string;
  private readonly permitErgoTree: string;
  private readonly fraudErgoTree: string;
  private readonly RWT: string;

  constructor(
    id: string,
    dataSource: DataSource,
    address: string,
    RWT: string,
    permitAddress: string,
    fraudAddress: string,
    logger?: AbstractLogger
  ) {
    super();
    this.id = id;
    this.dataSource = dataSource;
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
    this.logger = logger ? logger : new DummyLogger();
    this.actions = new EventTriggerAction(dataSource, this.logger);
  }

  getId = () => this.id;

  /**
   * gets block id and transactions corresponding to the block and saves if they are valid rosen
   *  transactions and in case of success return true and in case of failure returns false
   * @param block
   * @param txs
   */
  processTransactions = (
    txs: Array<Transaction>,
    block: Block
  ): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      try {
        const boxes: Array<ExtractedEventTrigger> = [];
        const txSpendIds: Array<{
          txId: string;
          spendBoxes: Array<string>;
          result: string;
          paymentTxId: string;
        }> = [];
        txs.forEach((transaction) => {
          // extract event result
          const { result, paymentTxId } = this.extractEventResult(transaction);
          for (const output of transaction.outputs) {
            try {
              if (
                output.additionalRegisters &&
                output.assets &&
                output.assets.length > 0 &&
                output.assets[0].tokenId === this.RWT &&
                output.ergoTree === this.eventTriggerErgoTree
              ) {
                const R4 = output.additionalRegisters.R4;
                const R5 = output.additionalRegisters.R5;
                const R7 = output.additionalRegisters.R7;
                if (R4 && R5 && R7) {
                  const outputParsed = wasm.ErgoBox.from_json(
                    JsonBI.stringify(output)
                  );
                  const R4Const = outputParsed.register_value(
                    wasm.NonMandatoryRegisterId.R4
                  );
                  const R5Const = outputParsed.register_value(
                    wasm.NonMandatoryRegisterId.R5
                  );
                  const R7Const = outputParsed.register_value(
                    wasm.NonMandatoryRegisterId.R7
                  );
                  if (R4Const && R5Const && R7Const) {
                    const R4Serialized = R4Const.to_byte_array();
                    const R5Serialized = R5Const.to_coll_coll_byte();
                    if (R4Serialized.length >= 1 && R5Serialized.length >= 12) {
                      const WIDsCount = R7Const.to_i32();
                      const WIDsHash =
                        Buffer.from(R4Serialized).toString('hex');
                      const sourceTxId = Buffer.from(
                        R5Serialized[0]
                      ).toString();
                      const eventId = Buffer.from(
                        blake2b(sourceTxId, undefined, 32)
                      ).toString('hex');
                      boxes.push({
                        eventId: eventId,
                        txId: transaction.id,
                        boxId: output.boxId,
                        boxSerialized: Buffer.from(
                          outputParsed.sigma_serialize_bytes()
                        ).toString('base64'),
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
                        sourceChainTokenId: Buffer.from(
                          R5Serialized[8]
                        ).toString(),
                        targetChainTokenId: Buffer.from(
                          R5Serialized[9]
                        ).toString(),
                        sourceTxId: sourceTxId,
                        fromChain: Buffer.from(R5Serialized[1]).toString(),
                        fromAddress: Buffer.from(R5Serialized[3]).toString(),
                        sourceBlockId: Buffer.from(R5Serialized[10]).toString(),
                        WIDsCount: WIDsCount,
                        WIDsHash: WIDsHash,
                        sourceChainHeight: Number(
                          BigInt(
                            '0x' + Buffer.from(R5Serialized[11]).toString('hex')
                          ).toString(10)
                        ),
                      });
                    }
                  }
                }
              }
            } catch {
              continue;
            }
          }
          // process inputs
          txSpendIds.push({
            txId: transaction.id,
            spendBoxes: transaction.inputs.map((box) => box.boxId),
            result: result,
            paymentTxId: paymentTxId,
          });
        });
        this.actions
          .storeEventTriggers(boxes, block, this.getId())
          .then(() => {
            txSpendIds.forEach((txSpends) => {
              this.actions
                .spendEventTriggers(
                  txSpends.spendBoxes,
                  block,
                  this.id,
                  txSpends.txId,
                  txSpends.result,
                  txSpends.paymentTxId
                )
                .then(() => {
                  resolve(true);
                });
            });
          })
          .catch((e) => {
            this.logger.error(
              `Error in storing permits of the block ${block}: ${e}`
            );
            reject(e);
          });
      } catch (e) {
        this.logger.error(
          `block ${block} doesn't save in the database with error: ${e}`
        );
        reject(e);
      }
    });
  };

  forkBlock = async (hash: string) => {
    await this.actions.deleteBlock(hash, this.getId());
  };

  /**
   * Extractor box initialization
   * No action needed in event trigger extractors
   */
  initializeBoxes = async () => {
    return;
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
            const txId = Buffer.from(R4Serialized).toString('hex');
            paymentTxId = txId;
            if (txId !== '') paymentTxId = txId;
            else {
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
