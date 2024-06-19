import ergoNodeClientFactory, {
  IndexedErgoBox,
} from '@rosen-clients/ergo-node';

import { BlockInfo } from '../../interfaces';
import { ErgoBox } from '../interfaces';
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
  convertToErgoBox = async (box: IndexedErgoBox): Promise<ErgoBox> => {
    const tx = await this.getTxBlock(box.transactionId!);
    const spendInfo = box.spentTransactionId
      ? await this.getTxBlock(box.spentTransactionId)
      : undefined;
    return {
      transactionId: box.transactionId || '',
      index: box.index || 0,
      value: box.value || 0n,
      ergoTree: box.ergoTree || '',
      creationHeight: box.creationHeight || 0,
      inclusionHeight: tx.height,
      assets: box.assets || [],
      additionalRegisters: box.additionalRegisters,
      boxId: box.boxId || '',
      blockId: tx.hash,
      spentBlockId: spendInfo?.hash ?? undefined,
      spentHeight: spendInfo?.height ?? undefined,
    };
  };

  /**
   * return block information of specified tx
   * @param txId
   */
  getTxBlock = async (txId: string): Promise<BlockInfo> => {
    const tx = await this.api.getTxById(txId);
    return {
      hash: tx.blockId,
      height: tx.inclusionHeight,
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
      boxes.map(async (box) => await this.convertToErgoBox(box))
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
      boxes.items.map(async (box) => await this.convertToErgoBox(box))
    );
    return { boxes: ergoBoxes, hasNextBatch: boxes.items.length > 0 };
  };
}
