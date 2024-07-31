import ergoNodeClientFactory, {
  IndexedErgoBox,
  IndexedErgoTransaction,
} from '@rosen-clients/ergo-node';

import { BlockInfo } from '../../interfaces';
import { ErgoBox, ExtendedTransaction } from '../interfaces';
import { AbstractNetwork } from './AbstractNetwork';

export class NodeNetwork extends AbstractNetwork {
  private api;

  constructor(url: string) {
    super();
    this.api = ergoNodeClientFactory(url);
  }

  /**
   * convert node api boxes to ErgoBox interface
   * @param box
   * @returns ErgoBox
   */
  convertBox = async (box: IndexedErgoBox): Promise<ErgoBox> => {
    const tx = await await this.api.getTxById(box.transactionId!);
    const spendInfo = box.spentTransactionId
      ? await this.getSpendingInfo(box.boxId!, box.spentTransactionId)
      : undefined;
    return {
      transactionId: box.transactionId || '',
      index: box.index || 0,
      value: box.value || 0n,
      ergoTree: box.ergoTree || '',
      creationHeight: box.creationHeight || 0,
      inclusionHeight: tx.inclusionHeight,
      assets: box.assets || [],
      additionalRegisters: box.additionalRegisters,
      boxId: box.boxId || '',
      blockId: tx.blockId,
      spentBlockId: spendInfo?.hash,
      spentHeight: spendInfo?.height,
      spentTransactionId: box.spentTransactionId,
      spentIndex: spendInfo?.spendIndex,
    };
  };

  /**
   * convert Node transaction to extractor transaction type
   * @param tx
   */
  private convertTransaction = (
    tx: IndexedErgoTransaction
  ): ExtendedTransaction => {
    return {
      id: tx.id || '',
      inclusionHeight: tx.inclusionHeight,
      blockId: tx.blockId,
      outputs: tx.outputs.map((output) => ({
        transactionId: output.transactionId || '',
        index: output.index || 0,
        value: output.value || 0n,
        ergoTree: output.ergoTree || '',
        creationHeight: output.creationHeight || 0,
        assets: output.assets || [],
        additionalRegisters: output.additionalRegisters,
        boxId: output.boxId || '',
      })),
      inputs: tx.inputs,
      dataInputs: tx.dataInputs,
    };
  };

  /**
   * return spending information of a specified box by having spendTxId
   * @param boxId
   * @param spendTxId
   */
  getSpendingInfo = async (
    boxId: string,
    spendTxId: string
  ): Promise<BlockInfo & { spendIndex: number }> => {
    const tx = await this.api.getTxById(spendTxId);
    const spendIndex = tx.inputs?.findIndex((box) => box.boxId == boxId);
    if (spendIndex == undefined)
      throw Error(
        `Impossible behavior, the box [${boxId}] should have been spent in tx [${spendTxId}]`
      );
    return {
      hash: tx.blockId,
      height: tx.inclusionHeight,
      spendIndex,
    };
  };

  /**
   * use node api to return related boxes by specified address
   * @param address
   * @param offset
   * @param limit
   * @returns related boxes
   */
  getBoxesByAddress = async (
    address: string,
    offset: number,
    limit: number
  ): Promise<{ boxes: ErgoBox[]; hasNextBatch: boolean }> => {
    const boxes = await this.api.getBoxesByAddressUnspent(address, {
      offset: offset,
      limit: limit,
      sortDirection: 'desc',
    });
    if (!boxes)
      throw new Error('Ergo node BoxesByAddress api expected to have items');
    const ergoBoxes = await Promise.all(
      boxes.map(async (box) => await this.convertBox(box))
    );
    return { boxes: ergoBoxes, hasNextBatch: boxes.length > 0 };
  };

  /**
   * use node api to return related boxes by specified token id
   * @param tokenId
   * @param offset
   * @param limit
   * @returns related boxes
   */
  getBoxesByTokenId = async (
    tokenId: string,
    offset: number,
    limit: number
  ): Promise<{ boxes: ErgoBox[]; hasNextBatch: boolean }> => {
    const boxes = await this.api.getBoxesByTokenId(tokenId, {
      offset: offset,
      limit: limit,
    });
    if (!boxes.items)
      throw new Error('Ergo node BoxesByTokenId api expected to have items');
    const ergoBoxes = await Promise.all(
      boxes.items.map(async (box) => await this.convertBox(box))
    );
    return { boxes: ergoBoxes, hasNextBatch: boxes.items.length > 0 };
  };

  /**
   * use node api to return related transactions of the specified address with limit offset
   * @param tokenId
   * @param offset
   * @param limit
   * @returns related transactions
   */
  getAddressTransactionsWithOffsetLimit = async (
    address: string,
    offset: number,
    limit: number
  ): Promise<{ items: Array<ExtendedTransaction>; total: number }> => {
    const txs = await this.api.getTxsByAddress(address, {
      offset,
      limit,
    });
    if (!txs.items)
      throw new Error(
        'Explorer AddressTransactions api expected to have items'
      );
    return {
      items: txs.items.map((tx) => this.convertTransaction(tx)),
      total: txs.total!,
    };
  };
}
