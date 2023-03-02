import { DataSource } from 'typeorm';
import * as wasm from 'ergo-lib-wasm-nodejs';
import { Buffer } from 'buffer';
import { blake2b } from 'blakejs';
import { ExtractedObservation } from '../../interfaces/extractedObservation';
import { ObservationEntityAction } from '../../actions/db';
import { RosenData } from '../../interfaces/rosen';
import {
  AbstractExtractor,
  BlockEntity,
  Transaction,
  OutputBox,
} from '@rosen-bridge/scanner';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/logger-interface';
import { RosenTokens, TokenMap } from '@rosen-bridge/tokens';
import { ERGO_NATIVE_TOKEN } from '../const';

export class ErgoObservationExtractor extends AbstractExtractor<Transaction> {
  readonly logger: AbstractLogger;
  private readonly dataSource: DataSource;
  private readonly tokens: TokenMap;
  private readonly actions: ObservationEntityAction;
  private readonly bankErgoTree: string;
  static readonly FROM_CHAIN: string = 'ergo';

  constructor(
    dataSource: DataSource,
    tokens: RosenTokens,
    address: string,
    logger?: AbstractLogger
  ) {
    super();
    this.bankErgoTree = wasm.Address.from_base58(address)
      .to_ergo_tree()
      .to_base16_bytes();
    this.dataSource = dataSource;
    this.tokens = new TokenMap(tokens);
    this.logger = logger ? logger : new DummyLogger();
    this.actions = new ObservationEntityAction(dataSource, this.logger);
  }

  /**
   * get Id for current extractor
   */
  getId = () => 'ergo-observation-extractor';

  /**
   * returns token transfer data object if the box format is like rosen bridge observations otherwise returns undefined
   * @param box
   */
  getTransferData = (box: OutputBox): RosenData | undefined => {
    try {
      if (box.additionalRegisters && box.additionalRegisters.R4) {
        const R4 = wasm.Constant.decode_from_base16(box.additionalRegisters.R4);
        if (R4) {
          const R4Serialized = R4.to_coll_coll_byte();
          const [assetId, amount] =
            box.assets && box.assets.length >= 1
              ? [box.assets[0].tokenId, box.assets[0].amount]
              : [ERGO_NATIVE_TOKEN, box.value];
          if (
            R4Serialized.length >= 5 &&
            this.toTargetToken(
              assetId,
              Buffer.from(R4Serialized[0]).toString()
            ) != undefined
          ) {
            return {
              tokenId: assetId,
              toChain: Buffer.from(R4Serialized[0]).toString(),
              toAddress: Buffer.from(R4Serialized[1]).toString(),
              networkFee: Buffer.from(R4Serialized[2]).toString(),
              bridgeFee: Buffer.from(R4Serialized[3]).toString(),
              fromAddress: Buffer.from(R4Serialized[4]).toString(),
              amount: amount,
            };
          }
        }
      }
    } catch {
      return undefined;
    }
    return undefined;
  };

  /**
   * Should return the target token hex string id
   * @param tokenId
   * @param toChain
   */
  toTargetToken = (tokenId: string, toChain: string): string => {
    const tokens = this.tokens.search(ErgoObservationExtractor.FROM_CHAIN, {
      tokenId: tokenId,
    })[0];
    return this.tokens.getID(tokens, toChain);
  };

  /**
   * gets block id and transactions corresponding to the block and saves if they are valid rosen
   *  transactions and in case of success return true and in case of failure returns false
   * @param txs
   * @param block
   */
  processTransactions = (
    txs: Array<Transaction>,
    block: BlockEntity
  ): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      try {
        const observations: Array<ExtractedObservation> = [];
        txs.forEach((transaction) => {
          for (const output of transaction.outputs) {
            if (
              output.ergoTree === this.bankErgoTree &&
              output.additionalRegisters &&
              output.additionalRegisters.R4
            ) {
              const data = this.getTransferData(output);
              if (data !== undefined && output.assets) {
                const requestId = Buffer.from(
                  blake2b(output.transactionId, undefined, 32)
                ).toString('hex');
                observations.push({
                  fromChain: ErgoObservationExtractor.FROM_CHAIN,
                  toChain: data.toChain,
                  networkFee: data.networkFee,
                  bridgeFee: data.bridgeFee,
                  amount: data.amount.toString(),
                  sourceChainTokenId: data.tokenId,
                  targetChainTokenId: this.toTargetToken(
                    data.tokenId,
                    data.toChain
                  ),
                  sourceTxId: output.transactionId,
                  sourceBlockId: block.hash,
                  requestId: requestId,
                  toAddress: data.toAddress,
                  fromAddress: data.fromAddress,
                });
              }
            }
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
