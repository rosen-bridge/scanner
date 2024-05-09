import * as wasm from 'ergo-lib-wasm-nodejs';
import { DataSource } from 'typeorm';
import { Transaction } from '@rosen-bridge/scanner';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { AbstractExtractor, Block } from '@rosen-bridge/extractor';

import CommitmentAction from '../actions/commitmentAction';
import { extractedCommitment } from '../interfaces/extractedCommitment';
import { JsonBI } from '../utils';
import { SpendInfo } from '../interfaces/types';

class CommitmentExtractor extends AbstractExtractor<Transaction> {
  readonly logger: AbstractLogger;
  id: string;
  private readonly dataSource: DataSource;
  private readonly commitmentsErgoTrees: Array<string>;
  private readonly RWTId: string;
  private readonly actions: CommitmentAction;

  constructor(
    id: string,
    addresses: Array<string>,
    RWTId: string,
    dataSource: DataSource,
    logger?: AbstractLogger
  ) {
    super();
    this.id = id;
    this.dataSource = dataSource;
    this.commitmentsErgoTrees = addresses.map((address) =>
      wasm.Address.from_base58(address).to_ergo_tree().to_base16_bytes()
    );
    this.RWTId = RWTId;
    this.logger = logger ? logger : new DummyLogger();
    this.actions = new CommitmentAction(dataSource, this.logger);
  }

  /**
   * get Id for current extractor
   */
  getId = () => this.id;

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
        const commitments: Array<extractedCommitment> = [];
        const spendIds: Array<SpendInfo> = [];
        txs.forEach((transaction) => {
          // process outputs
          for (const output of transaction.outputs) {
            if (
              output.assets &&
              output.additionalRegisters &&
              output.assets.length > 0 &&
              output.assets[0].tokenId === this.RWTId &&
              this.commitmentsErgoTrees.indexOf(output.ergoTree) !== -1
            ) {
              try {
                const decodedBox = wasm.ErgoBox.from_json(
                  JsonBI.stringify(output)
                );
                const R4 = decodedBox.register_value(
                  wasm.NonMandatoryRegisterId.R4
                );
                const R5 = decodedBox.register_value(
                  wasm.NonMandatoryRegisterId.R5
                );
                const R6 = decodedBox.register_value(
                  wasm.NonMandatoryRegisterId.R6
                );
                if (R4 && R5 && R6) {
                  const R4Value = R4.to_byte_array();
                  const R5Value = R5.to_byte_array();
                  const R6Value = R6.to_byte_array();
                  const WID = Buffer.from(R4Value).toString('hex');
                  const requestId = Buffer.from(R5Value).toString('hex');
                  const eventDigest = Buffer.from(R6Value).toString('hex');
                  commitments.push({
                    txId: transaction.id,
                    WID: WID,
                    commitment: eventDigest,
                    eventId: requestId,
                    boxId: output.boxId,
                    boxSerialized: Buffer.from(
                      decodedBox.sigma_serialize_bytes()
                    ).toString('base64'),
                    rwtCount: BigInt(output.assets[0].amount).toString(),
                  });
                }
              } catch {
                // empty
              }
            }
          }
          // process inputs
          for (let i = 0; i < transaction.inputs.length; i++) {
            spendIds.push({
              boxId: transaction.inputs[i].boxId,
              txId: transaction.id,
              index: i,
            });
          }
        });
        // process save commitments
        this.actions
          .storeCommitments(commitments, block, this.id)
          .then(() => {
            this.actions.spendCommitments(spendIds, block, this.id).then(() => {
              resolve(true);
            });
          })
          .catch((e) => reject(e));
      } catch (e) {
        this.logger.error(
          `Error in soring permits of the block ${block}: ${e}`
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
    await this.actions.deleteBlock(hash, this.getId());
  };

  /**
   * Extractor box initialization
   * No action needed for commitment extractor
   */
  initializeBoxes = async () => {
    return;
  };
}

export default CommitmentExtractor;
