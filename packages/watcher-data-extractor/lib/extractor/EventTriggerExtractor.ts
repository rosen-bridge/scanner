import { DataSource } from 'typeorm';
import * as wasm from 'ergo-lib-wasm-nodejs';
import EventTriggerDB from '../actions/EventTriggerDB';
import {
  AbstractExtractor,
  BlockEntity,
  Transaction,
} from '@rosen-bridge/scanner';
import { ExtractedEventTrigger } from '../interfaces/extractedEventTrigger';
import { JsonBI } from '../network/parser';

class EventTriggerExtractor extends AbstractExtractor<Transaction> {
  id: string;
  private readonly dataSource: DataSource;
  private readonly actions: EventTriggerDB;
  private readonly eventTriggerErgoTree: string;
  private readonly RWT: string;

  constructor(
    id: string,
    dataSource: DataSource,
    address: string,
    RWT: string
  ) {
    super();
    this.id = id;
    this.dataSource = dataSource;
    this.actions = new EventTriggerDB(dataSource);
    this.eventTriggerErgoTree = wasm.Address.from_base58(address)
      .to_ergo_tree()
      .to_base16_bytes();
    this.RWT = RWT;
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
    block: BlockEntity
  ): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      try {
        const boxes: Array<ExtractedEventTrigger> = [];
        const spendIds: Array<string> = [];
        txs.forEach((transaction) => {
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
                if (R4 && R5) {
                  const outputParsed = wasm.ErgoBox.from_json(
                    JsonBI.stringify(output)
                  );
                  const R4Const = outputParsed.register_value(
                    wasm.NonMandatoryRegisterId.R4
                  );
                  const R5Const = outputParsed.register_value(
                    wasm.NonMandatoryRegisterId.R5
                  );
                  if (R4Const && R5Const) {
                    const R4Serialized = R4Const.to_coll_coll_byte();
                    const R5Serialized = R5Const.to_coll_coll_byte();
                    if (R4Serialized.length >= 1 && R5Serialized.length >= 11) {
                      const WIDs = R4Serialized.map((byteArray) =>
                        Buffer.from(byteArray).toString('hex')
                      ).join(',');
                      boxes.push({
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
                        sourceTxId: Buffer.from(R5Serialized[0]).toString(),
                        fromChain: Buffer.from(R5Serialized[1]).toString(),
                        fromAddress: Buffer.from(R5Serialized[3]).toString(),
                        sourceBlockId: Buffer.from(R5Serialized[10]).toString(),
                        WIDs: WIDs,
                      });
                    }
                  }
                }
              }
            } catch {
              continue;
            }
            // process inputs
            for (const input of transaction.inputs) {
              spendIds.push(input.boxId);
            }
          }
        });
        this.actions
          .storeEventTriggers(boxes, block, this.getId())
          .then(() => {
            this.actions
              .spendEventTriggers(spendIds, block, this.id)
              .then(() => {
                resolve(true);
              });
          })
          .catch((e) => {
            console.log(`Error in soring permits of the block ${block}`);
            console.log(e);
            reject(e);
          });
      } catch (e) {
        console.log(
          `block ${block} doesn't save in the database with error`,
          e
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
}

export default EventTriggerExtractor;
