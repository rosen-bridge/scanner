import { DataSource } from 'typeorm';
import { Buffer } from 'buffer';
import { blake2b } from 'blakejs';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { TokenMap } from '@rosen-bridge/tokens';
import { ErgoNodeRosenExtractor } from '@rosen-bridge/rosen-extractor';
import { Block, Transaction } from '@rosen-bridge/scanner-interfaces';
import { AbstractExtractor } from '@rosen-bridge/abstract-extractor';
import { ExtractedObservation } from '@rosen-bridge/abstract-observation-extractor';
import { ObservationEntityAction } from '@rosen-bridge/abstract-observation-extractor';
import { NUMBER_OF_BLOCKS_PER_YEAR } from '../const';

export class ErgoObservationExtractor extends AbstractExtractor<Transaction> {
  readonly logger: AbstractLogger;
  private readonly actions: ObservationEntityAction;
  private readonly extractor: ErgoNodeRosenExtractor;
  static readonly FROM_CHAIN: string = 'ergo';

  constructor(
    dataSource: DataSource,
    tokens: TokenMap,
    address: string,
    logger?: AbstractLogger
  ) {
    super();
    this.logger = logger ? logger : new DummyLogger();
    this.actions = new ObservationEntityAction(dataSource, this.logger);
    this.extractor = new ErgoNodeRosenExtractor(address, tokens, this.logger);
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
              fromChain: ErgoObservationExtractor.FROM_CHAIN,
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
        this.actions
          .storeObservations(observations, block, this.getId())
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
   * fork one block and remove all stored information for this block
   * @param hash: block hash
   */
  forkBlock = async (hash: string): Promise<void> => {
    await this.actions.deleteBlockObservation(hash, this.getId());
  };

  /**
   * Extractor box initialization
   * No action needed in cardano extractors
   */
  initializeBoxes = async () => {
    return;
  };
}
