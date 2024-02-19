import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import {
  AbstractExtractor,
  BlockEntity,
  OutputBox,
  Transaction,
} from '@rosen-bridge/scanner';
import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';
import { TransactionInfo } from '@rosen-clients/ergo-explorer/dist/src/v1/types';
import { OutputInfo } from '@rosen-clients/ergo-explorer/dist/src/v1/types/outputInfo';
import * as ergoLib from 'ergo-lib-wasm-nodejs';
import { DataSource } from 'typeorm';
import CollateralAction from '../actions/collateralAction';
import { DefaultApiLimit } from '../constants';
import { ExtractedCollateral } from '../interfaces/extractedCollateral';
import { JsonBI, uint8ArrayToHex } from '../utils';

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
    const boxes: Array<ExtractedCollateral> = [];
    const spendBoxIds: Array<string> = [];
    for (const tx of txs) {
      for (const outputBox of tx.outputs) {
        if (!this.isCollateralBox(outputBox)) {
          continue;
        }
        boxes.push(this.toExtractedCollateral(outputBox));
      }

      spendBoxIds.push(...tx.inputs.map((box) => box.boxId));
    }

    try {
      await this.action.storeCollaterals(boxes, block, this.getId());
      await this.action.spendCollaterals(spendBoxIds, block, this.getId());
    } catch (e) {
      this.logger.error(
        `Error in storing collaterals of the block ${block}: ${e}`
      );
      return false;
    }

    return true;
  };

  private isCollateralBox(outputBox: OutputBox): boolean {
    const awcNft = outputBox.assets?.at(0)?.tokenId;
    return (
      awcNft != undefined &&
      awcNft === this.awcNft &&
      outputBox.ergoTree === this.ergoTree
    );
  }

  forkBlock: (hash: string) => Promise<void>;

  /**
   * Initializes the database with older collaterals
   *
   * @param {number} initialHeight
   * @return {Promise<void>}
   * @memberof CollateralExtractor
   */
  initializeBoxes = async (initialHeight: number): Promise<void> => {
    const unspentCollaterals = await this.getAllUnspentCollaterals(
      initialHeight
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
      initialHeight,
      storedUnspentCollateralBoxIds.filter(
        (boxId) => !unspentCollateralBoxIds.has(boxId)
      )
    );

    for (const collateral of unspentCollaterals) {
      this.logger.debug(
        `saving unspent collateral with boxId=[${collateral.boxId}] to database for initialization`
      );
      await this.action.saveCollateral(collateral, this.getId());
      this.logger.debug(
        `saved unspent collateral with boxId=[${collateral.boxId}] to database for initialization`
      );
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
      let boxInfo: OutputInfo;
      try {
        boxInfo = await this.explorerApi.v1.getApiV1BoxesP1(boxId);
      } catch (e: any) {
        if (e?.response?.status === 404) {
          this.action.deleteCollateral(boxId, this.getId());
        } else {
          throw new Error(
            `something went wrong when trying to get box=[${boxId}] from Ergo network: ${e?.message}`
          );
        }
        return;
      }

      if (boxInfo?.spentTransactionId != null) {
        try {
          const transactionInfo: TransactionInfo =
            await this.explorerApi.v1.getApiV1TransactionsP1(
              boxInfo.spentTransactionId
            );

          if (transactionInfo.inclusionHeight < initialHeight) {
            this.action.saveCollateral(
              {
                boxId: boxId,
                spendHeight: transactionInfo.inclusionHeight,
                spendBlock: transactionInfo.blockId,
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
          .map((box) => this.toExtractedCollateral(box))
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
    box: OutputInfo | OutputBox
  ): ExtractedCollateral => {
    const ergoOutputBox = ergoLib.ErgoBox.from_json(JsonBI.stringify(box));

    let r4: Uint8Array | undefined;
    try {
      r4 = ergoOutputBox
        .register_value(ergoLib.NonMandatoryRegisterId.R4)
        ?.to_byte_array();
    } catch (e) {
      throw new Error(`collateral box with boxId=${box.boxId} skipped: ${e}`);
    }
    if (r4 == undefined) {
      throw new Error(
        `collateral box with boxId=${box.boxId} skipped, because of an invalid R4 register`
      );
    }
    const wId = uint8ArrayToHex(r4);
    this.logger.debug(
      `Extracted WID=[${wId}] from R4 register of box=${ergoOutputBox
        .box_id()
        .to_str()}`
    );

    let r5: string | undefined;
    try {
      r5 = ergoOutputBox
        .register_value(ergoLib.NonMandatoryRegisterId.R5)
        ?.to_i64()
        .to_str();
    } catch (e) {
      throw new Error(`collateral box with boxId=${box.boxId} skipped: ${e}`);
    }
    if (r5 == undefined) {
      throw new Error(
        `collateral box with boxId=${box.boxId} skipped, because of an invalid R5 register`
      );
    }
    const rwtCount = BigInt(r5);
    this.logger.debug(
      `Extracted rwtCount=[${rwtCount}] from R5 register of box=${ergoOutputBox
        .box_id()
        .to_str()}`
    );

    return {
      boxId: box.boxId,
      boxSerialized: Buffer.from(
        ergoOutputBox.sigma_serialize_bytes()
      ).toString('base64'),
      wId: wId,
      rwtCount: rwtCount,
      txId: box.transactionId,
      height: Number(box.creationHeight),
    };
  };
}
