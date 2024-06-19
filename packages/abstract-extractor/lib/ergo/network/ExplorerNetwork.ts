import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';

import { BlockInfo } from '../../interfaces';
import { ErgoBox } from '../interfaces';
import { AbstractNetwork } from './AbstractNetwork';
import { V1 } from '@rosen-clients/ergo-explorer';

export class ExplorerNetwork extends AbstractNetwork {
  private api;

  constructor(url: string) {
    super();
    this.api = ergoExplorerClientFactory(url);
  }

  /**
   * return block information of specified tx
   * @param txId
   */
  getTxBlock = async (txId: string): Promise<BlockInfo> => {
    const tx = await this.api.v1.getApiV1TransactionsP1(txId);
    return {
      hash: tx.blockId,
      height: tx.inclusionHeight,
    };
  };

  /**
   * convert explorer api boxes to ErgoBox interface
   * @param box
   * @returns ErgoBox
   */
  convertBox = async (box: V1.OutputInfo): Promise<ErgoBox> => {
    const spendInfo = box.spentTransactionId
      ? await this.getTxBlock(box.spentTransactionId)
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
      additionalRegisters: box.additionalRegisters,
      assets: box.assets,
      spentHeight: spendInfo?.height,
      spentBlockId: spendInfo?.hash,
    };
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
