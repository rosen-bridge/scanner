import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import {
  AbstractExtractor,
  BlockEntity,
  InitialInfo,
  OutputBox,
  Transaction,
} from '@rosen-bridge/scanner';
import ergoExplorerClientFactory, { V1 } from '@rosen-clients/ergo-explorer';
import * as ergoLib from 'ergo-lib-wasm-nodejs';
import { DataSource } from 'typeorm';
import CollateralAction from '../actions/collateralAction';
import { DefaultApiLimit } from '../constants';
import { ExtractedCollateral } from '../interfaces/extractedCollateral';
import { JsonBI, uint8ArrayToHex } from '../utils';
import { SpendInfo } from '../interfaces/types';

export class CollateralExtractor extends AbstractExtractor<Transaction> {
  private readonly ergoTree: string;
  readonly action: CollateralAction;
  private explorerApi;

  constructor(
    private readonly id: string,
    private readonly awcNft: string,
    private readonly address: string,
    private readonly dataSource: DataSource,
    explorerUrl: string,
    private readonly logger: AbstractLogger = new DummyLogger()
  ) {
    super();
    this.ergoTree = ergoLib.Address.from_base58(this.address)
      .to_ergo_tree()
      .to_base16_bytes();
    this.action = new CollateralAction(this.dataSource, this.logger);
    this.explorerApi = ergoExplorerClientFactory(explorerUrl);
  }

  /**
   * get id for extractor. This id must be unique over all extractors.
   *
   * @return {string}
   */
  getId = (): string => this.id;

  /**
   * process a list of transactions and store collateral box details
   *
   * @param {Transaction[]} txs list of transaction for block
   * @param {BlockEntity} block block id for transactions as hex encoded
   * @return {Promise<boolean>} Promise<boolean> if no error occurred return
   * true. otherwise, return false
   */
  processTransactions = async (
    txs: Transaction[],
    block: BlockEntity
  ): Promise<boolean> => {
    try {
      const boxes: Array<ExtractedCollateral> = [];
      const spentInfos: Array<SpendInfo> = [];
      for (const tx of txs) {
        const outputBox = tx.outputs.at(1);
        if (outputBox == undefined) {
          continue;
        }

        if (!this.isCollateralBox(outputBox)) {
          continue;
        }
        const extractedCollateral = this.toExtractedCollateral(
          outputBox,
          block.hash,
          block.height
        );
        if (extractedCollateral) boxes.push(extractedCollateral);

        const inputCollateral = tx.inputs.at(1);
        if (inputCollateral != undefined) {
          spentInfos.push({ txId: tx.id, boxId: inputCollateral.boxId });
        }
      }
      if (boxes.length > 0)
        await this.action.storeCollaterals(boxes, block, this.getId());
      await this.action.spendCollaterals(spentInfos, block, this.getId());
    } catch (e) {
      this.logger.error(
        `Error in storing collaterals of the block ${block}: ${e}`
      );
      return false;
    }

    return true;
  };

  /**
   * checks if the passed box is a collateral box
   *
   * @private
   * @param {OutputBox} outputBox
   * @return {boolean}
   * @memberof CollateralExtractor
   */
  private isCollateralBox = (outputBox: OutputBox): boolean => {
    const awcNft = outputBox.assets?.at(0)?.tokenId;
    return (
      awcNft != undefined &&
      awcNft === this.awcNft &&
      outputBox.ergoTree === this.ergoTree
    );
  };

  /**
   * Delete all collaterals corresponding to the passed block and extractor and
   * update all collaterals spent in the specified block
   *
   * @param {string} hash
   * @return {Promise<void>}
   * @memberof CollateralExtractor
   */
  forkBlock = async (hash: string): Promise<void> => {
    await this.action.deleteBlock(hash, this.getId());
  };

  /**
   * Initializes the database with older collaterals
   *
   * @param {number} initialHeight
   * @return {Promise<void>}
   * @memberof CollateralExtractor
   */
  initializeBoxes = async (initialBlock: InitialInfo): Promise<void> => {
    const unspentCollaterals = await this.getAllUnspentCollaterals(
      initialBlock.height
    );
    this.logger.debug(
      `unspent collateral box info with following IDs gotten form Ergo network: [${unspentCollaterals
        .map((box) => box.boxId)
        .join(', ')}]`
    );

    const storedUnspentCollateralBoxIds =
      await this.action.getUnspentCollateralBoxIds(this.getId());
    const unspentCollateralBoxIds = new Set(
      unspentCollaterals.map((box) => box.boxId)
    );
    await this.tidyUpStoredCollaterals(
      initialBlock.height,
      storedUnspentCollateralBoxIds.filter(
        (boxId) => !unspentCollateralBoxIds.has(boxId)
      )
    );

    for (const collateral of unspentCollaterals) {
      if (storedUnspentCollateralBoxIds.includes(collateral.boxId)) {
        this.logger.debug(
          `updating unspent collateral with boxId=[${collateral.boxId}] at initialization phase`
        );
        await this.action.updateCollateral(collateral, this.getId());
      } else {
        this.logger.debug(
          `inserting unspent collateral with boxId=[${collateral.boxId}] to database at initialization phase`
        );
        await this.action.insertCollateral(collateral, this.getId());
      }
    }
  };

  /**
   * removes or updates stored collateral boxes before initializing boxes
   *
   * @private
   * @param {number} initialHeight
   * @param {string[]} collateralBoxIds
   * @return {Promise<void>}
   * @memberof CollateralExtractor
   */
  private async tidyUpStoredCollaterals(
    initialHeight: number,
    collateralBoxIds: string[]
  ) {
    for (const boxId of collateralBoxIds) {
      let boxInfo: V1.OutputInfo;
      try {
        boxInfo = await this.explorerApi.v1.getApiV1BoxesP1(boxId);
      } catch (e: any) {
        if (e?.response?.status === 404) {
          await this.action.deleteCollateral(boxId, this.getId());
          continue;
        } else {
          throw new Error(
            `something went wrong when trying to get box=[${boxId}] from Ergo network: ${e?.message}`
          );
        }
      }

      if (boxInfo?.spentTransactionId != null) {
        try {
          const transactionInfo: V1.TransactionInfo =
            await this.explorerApi.v1.getApiV1TransactionsP1(
              boxInfo.spentTransactionId
            );

          if (transactionInfo.inclusionHeight < initialHeight) {
            this.logger.debug(
              `collateral with boxId=[${boxId}] is spent and is being updated with spendHeight=[${transactionInfo.inclusionHeight}] and spendBlock=[${transactionInfo.blockId}]`
            );

            await this.action.updateCollateral(
              {
                boxId: boxId,
                spendHeight: transactionInfo.inclusionHeight,
                spendBlock: transactionInfo.blockId,
                spendTxId: transactionInfo.id,
              },
              this.getId()
            );
          }
        } catch (e: any) {
          throw new Error(
            `something went wrong when trying to get transaction=[${boxInfo.spentTransactionId}] from Ergo network: ${e?.message}`
          );
        }
      }
    }
  }

  /**
   * gets all unspent collaterals from Ergo explorer api
   *
   * @private
   * @param {number} initialHeight
   * @return {Promise<Array<ExtractedCollateral>>}
   * @memberof CollateralExtractor
   */
  private getAllUnspentCollaterals = async (
    initialHeight: number
  ): Promise<Array<ExtractedCollateral>> => {
    const extractedBoxes: Array<ExtractedCollateral> = [];
    let offset = 0;
    let total = 1;
    while (offset < total) {
      const boxes = await this.explorerApi.v1.getApiV1BoxesUnspentByergotreeP1(
        this.ergoTree,
        { offset: offset, limit: DefaultApiLimit }
      );

      if (!boxes.items) {
        throw new Error('Explorer api output items should not be undefined.');
      }

      extractedBoxes.push(
        ...boxes.items
          .filter(
            (box) =>
              box.creationHeight &&
              box.creationHeight < initialHeight &&
              this.isCollateralBox(box)
          )
          .map((box) =>
            this.toExtractedCollateral(box, box.blockId, box.settlementHeight)
          )
          .filter((data): data is ExtractedCollateral => data != undefined)
      );
      total = boxes.total;
      offset += DefaultApiLimit;
    }
    return extractedBoxes;
  };

  /**
   * converts output box information to an ExtractedCollateral object
   *
   * @private
   * @param {(OutputInfo | OutputBox)} box
   * @return {ExtractedCollateral}
   * @memberof CollateralExtractor
   */
  private toExtractedCollateral = (
    box: V1.OutputInfo | OutputBox,
    blockId: string,
    blockHeight: number
  ): ExtractedCollateral | undefined => {
    const ergoOutputBox = ergoLib.ErgoBox.from_json(JsonBI.stringify(box));

    const r4 = ergoOutputBox
      .register_value(ergoLib.NonMandatoryRegisterId.R4)
      ?.to_byte_array();
    if (r4 == undefined) {
      this.logger.warn(
        `collateral box with boxId=[${box.boxId}] has an invalid R4 register`
      );
      return undefined;
    }
    const wid = uint8ArrayToHex(r4);
    this.logger.debug(
      `Extracted WID=[${wid}] from R4 register of box=[${box.boxId}]`
    );

    const r5 = ergoOutputBox
      .register_value(ergoLib.NonMandatoryRegisterId.R5)
      ?.to_i64()
      .to_str();

    if (r5 == undefined) {
      this.logger.warn(
        `collateral box with boxId=[${box.boxId}] has an invalid R5 register`
      );
      return undefined;
    }
    const rwtCount = BigInt(r5);
    this.logger.debug(
      `Extracted rwtCount=[${rwtCount}] from R5 register of box=[${box.boxId}]`
    );

    return {
      boxId: box.boxId,
      boxSerialized: Buffer.from(
        ergoOutputBox.sigma_serialize_bytes()
      ).toString('base64'),
      wid: wid,
      rwtCount: rwtCount,
      txId: box.transactionId,
      block: blockId,
      height: blockHeight,
    };
  };
}
