import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';
import { BlockInfo } from '../../interfaces';
import { ErgoBox } from '../interfaces';
export class ExplorerNetwork {
  private api;

  constructor(url: string) {
    this.api = ergoExplorerClientFactory(url);
  }

  /**
   * Return block information of specified tx
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
   * Use explorer api to return related boxes by specified address
   * @param offset
   * @param limit
   * @returns related boxes
   */
  getBoxesByAddress = async (
    address: string,
    offset: number,
    limit: number
  ): Promise<{ boxes: ErgoBox[]; hasNextBatch: boolean }> => {
    const boxes = await this.api.v1.getApiV1BoxesByaddressP1(address, {
      offset: offset,
      limit: limit,
    });
    if (!boxes.items)
      throw new Error('Explorer BoxesByAddress api expected to have items');
    return { boxes: boxes.items, hasNextBatch: boxes.total > offset + limit };
  };

  /**
   * Use explorer api to return related boxes by specified address
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
    return { boxes: boxes.items, hasNextBatch: boxes.total > offset + limit };
  };
}
