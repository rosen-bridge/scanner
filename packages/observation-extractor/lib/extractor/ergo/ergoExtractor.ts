import { DataSource } from 'typeorm';
import { Buffer } from 'buffer';
import { blake2b } from 'blakejs';
import { ExtractedObservation } from '../../interfaces/extractedObservation';
import { Transaction } from '@rosen-bridge/scanner';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { TokenMap } from '@rosen-bridge/tokens';
import { ErgoNodeRosenExtractor } from '@rosen-bridge/rosen-extractor';
import { NUMBER_OF_BLOCKS_PER_YEAR } from '../const';
import { Block } from '@rosen-bridge/abstract-extractor';
import { AbstractObservationExtractor } from '../abstract/AbstractObservationExtractor';

export class ErgoObservationExtractor extends AbstractObservationExtractor<Transaction> {
  readonly FROM_CHAIN: string = 'ergo';

  constructor(
    dataSource: DataSource,
    tokens: TokenMap,
    address: string,
    logger?: AbstractLogger
  ) {
    super(
      dataSource,
      tokens,
      new ErgoNodeRosenExtractor(address, tokens, logger),
      logger
    );
  }

  /**
   * get Id for current extractor
   */
  getId = () => 'ergo-observation-extractor';

  /**
   * gets block id and transactions corresponding to the block and saves if they are valid rosen
   *  transactions and in case of success return true and in case of failure returns false
   * @param txs
   * @param block
   */
  processTransactions = (
    txs: Array<Transaction>,
    block: Block
  ): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      try {
        const observations: Array<ExtractedObservation> = [];
        txs.forEach((transaction) => {
          for (let i = 0; i < transaction.outputs.length; i++) {
            const box = transaction.outputs[i];
            if (
              block.height - Number(box.creationHeight) >
              NUMBER_OF_BLOCKS_PER_YEAR
            ) {
              this.logger.debug(
                `Skipping tx [${transaction.id}], box [${box.boxId}] creation_height [${box.creationHeight}] is more than a year ago [currentHeight: ${block.height}]`
              );
              return;
            }
          }
          const data = this.extractor.get(transaction);
          if (data) {
            const requestId = Buffer.from(
              blake2b(transaction.id, undefined, 32)
            ).toString('hex');
            observations.push({
              fromChain: this.FROM_CHAIN,
              toChain: data.toChain,
              networkFee: data.networkFee,
              bridgeFee: data.bridgeFee,
              amount: data.amount,
              sourceChainTokenId: data.sourceChainTokenId,
              targetChainTokenId: data.targetChainTokenId,
              sourceTxId: data.sourceTxId,
              sourceBlockId: block.hash,
              requestId: requestId,
              toAddress: data.toAddress,
              fromAddress: data.fromAddress,
            });
          }
        });
        this.storeObservations(observations, block)
          .then((status) => {
            resolve(status);
          })
          .catch((e) => {
            this.logger.error(
              `An error uncached exception occurred during store ergo observation: ${e}`
            );
            reject(e);
          });
      } catch (e) {
        this.logger.error(
          `An error occurred while saving block ${block}: [${e}]`
        );
        reject(e);
      }
    });
  };

  /**
   * gets transaction id from TransactionType
   */
  getTxId = (tx: Transaction) => tx.id;
}
