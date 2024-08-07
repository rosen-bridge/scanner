import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';
import { AbstractNetwork } from './AbstractNetwork';
import { V1 } from '@rosen-clients/ergo-explorer';

import { BlockInfo } from '../../interfaces';
import { ErgoBox, ExtendedTransaction, Transaction } from '../interfaces';
import { mapValues, pick } from 'lodash-es';
import { API_LIMIT } from '../../constants';

export class ExplorerNetwork extends AbstractNetwork {
  private api;

  constructor(url: string) {
    super();
    this.api = ergoExplorerClientFactory(url);
  }

  /**
   * return spending information of a specified box by having spendTxId
   * @param boxId
   * @param spendTxId
   */
  getSpendingInfo = async (
    boxId: string,
    spendTxId: string
  ): Promise<BlockInfo & { spendIndex: number }> => {
    const tx = await this.api.v1.getApiV1TransactionsP1(spendTxId);
    const spendIndex = tx.inputs?.findIndex((box) => box.boxId === boxId);
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
   * convert explorer api boxes to ErgoBox interface
   * @param box
   * @returns ErgoBox
   */
  private convertBox = async (box: V1.OutputInfo): Promise<ErgoBox> => {
    const spendInfo = box.spentTransactionId
      ? await this.getSpendingInfo(box.boxId, box.spentTransactionId)
      : undefined;
    return {
      blockId: box.blockId,
      boxId: box.boxId,
      creationHeight: box.creationHeight,
      inclusionHeight: box.settlementHeight,
      ergoTree: box.ergoTree,
      index: box.index,
      transactionId: box.transactionId,
      value: box.value,
      additionalRegisters: mapValues(
        box.additionalRegisters,
        'serializedValue'
      ),
      assets: box.assets?.map((asset) => pick(asset, ['tokenId', 'amount'])),
      spentHeight: spendInfo?.height,
      spentBlockId: spendInfo?.hash,
      spentTransactionId: box.spentTransactionId,
      spentIndex: spendInfo?.spendIndex,
    };
  };

  /**
   * convert explorer transaction to extractor transaction type
   * @param tx
   */
  private convertTransaction = (
    tx: V1.TransactionInfo
  ): ExtendedTransaction => {
    return {
      id: tx.id,
      inclusionHeight: tx.inclusionHeight,
      blockId: tx.blockId,
      dataInputs:
        tx.dataInputs?.map((dataInput) => ({
          boxId: dataInput.boxId,
        })) ?? [],
      inputs: tx.inputs?.map((input) => ({ boxId: input.boxId })) ?? [],
      outputs:
        tx.outputs?.map((output) => ({
          boxId: output.boxId,
          transactionId: output.transactionId,
          additionalRegisters: mapValues(
            output.additionalRegisters,
            'serializedValue'
          ),
          assets: output.assets?.map((asset) =>
            pick(asset, ['tokenId', 'amount'])
          ),
          ergoTree: output.ergoTree,
          creationHeight: output.creationHeight,
          index: output.index,
          value: output.value,
        })) ?? [],
    };
  };

  /**
   * convert explorer block transaction to transaction type
   * @param tx
   */
  private convertBlockTransaction = (tx: V1.TransactionInfo1): Transaction => {
    return {
      id: tx.id,
      dataInputs:
        tx.dataInputs?.map((dataInput) => ({
          boxId: dataInput.id,
        })) ?? [],
      inputs: tx.inputs?.map((input) => ({ boxId: input.id })) ?? [],
      outputs:
        tx.outputs?.map((output) => ({
          boxId: output.id,
          transactionId: output.txId,
          additionalRegisters: output.additionalRegisters,
          assets: output.assets?.map((asset) =>
            pick(asset, ['tokenId', 'amount'])
          ),
          ergoTree: output.ergoTree,
          creationHeight: output.creationHeight,
          index: output.index,
          value: output.value,
        })) ?? [],
    };
  };

  /**
   * use explorer api to return related transactions of the specified address in the height range
   * @param tokenId
   * @param offset
   * @param limit
   * @returns related transactions
   */
  getAddressTransactionsWithHeight = async (
    address: string,
    fromHeight: number,
    toHeight: number
  ): Promise<Array<ExtendedTransaction>> => {
    const txs = await this.api.v1.getApiV1AddressesP1Transactions(address, {
      fromHeight,
      toHeight,
      limit: API_LIMIT,
    });
    if (!txs.items)
      throw new Error(
        'Explorer AddressTransactions api expected to have items'
      );
    return txs.items.map((tx) => this.convertTransaction(tx));
  };

  /**
   * use explorer api to get the block id at the specified height
   * @param height
   * @returns block id
   */
  getBlockIdAtHeight = async (height: number): Promise<string> => {
    const header = await this.api.v1.getApiV1BlocksHeaders({
      offset: height,
      limit: 1,
    });
    if (!header.items) {
      throw new Error(
        `Expected explorer block header api at height ${height} to have items`
      );
    }
    return header.items[0].id;
  };

  /**
   * use explorer api to return all transactions in a block
   * @param blockId
   * @returns converted transactions
   */
  getBlockTxs = async (blockId: string): Promise<Array<Transaction>> => {
    const block = await this.api.v1.getApiV1BlocksP1(blockId);
    if (!block.block.blockTransactions) {
      throw new Error(
        `Expected explorer block api to include block transactions for block ${blockId}`
      );
    }
    return block.block.blockTransactions.map((tx) =>
      this.convertBlockTransaction(tx)
    );
  };

  /**
   * use explorer api to return related boxes by specified address
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
    const boxes = await this.api.v1.getApiV1BoxesUnspentByaddressP1(address, {
      offset: offset,
      limit: limit,
      sortDirection: 'desc',
    });
    if (!boxes.items)
      throw new Error('Explorer BoxesByAddress api expected to have items');
    const resultBoxes: Array<ErgoBox> = [];
    for (const box of boxes.items) {
      resultBoxes.push(await this.convertBox(box));
    }
    return { boxes: resultBoxes, hasNextBatch: boxes.total > offset + limit };
  };

  /**
   * use explorer api to return related boxes by specified token id
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
    const boxes = await this.api.v1.getApiV1BoxesBytokenidP1(tokenId, {
      offset: offset,
      limit: limit,
    });
    if (!boxes.items)
      throw new Error('Explorer BoxesByTokeId api expected to have items');
    const resultBoxes: Array<ErgoBox> = [];
    for (const box of boxes.items) {
      resultBoxes.push(await this.convertBox(box));
    }
    return { boxes: resultBoxes, hasNextBatch: boxes.total > offset + limit };
  };
}
