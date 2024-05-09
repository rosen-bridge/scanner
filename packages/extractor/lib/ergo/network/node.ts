import { BlockInfo } from '../../interfaces';
import { ErgoBox } from '../interfaces';
import ergoNodeClientFactory, {
  IndexedErgoBox,
} from '@rosen-clients/ergo-node';
export class NodeNetwork {
  private api;

  constructor(url: string) {
    this.api = ergoNodeClientFactory(url);
  }

  convertToErgoBox = async (box: IndexedErgoBox): Promise<ErgoBox> => ({
    transactionId: box.transactionId || '',
    index: box.index || 0,
    value: box.value || 0n,
    ergoTree: box.ergoTree || '',
    creationHeight: box.creationHeight || 0,
    assets: box.assets || [],
    additionalRegisters: box.additionalRegisters,
    boxId: box.boxId || '',
    blockId: (await this.getTxBlock(box.transactionId!)).hash,
  });

  /**
   * Return block information of specified tx
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
    const boxes = await this.api.getBoxesByAddress(address, {
      offset: offset,
      limit: limit,
    });
    if (!boxes.items)
      throw new Error('Ergo node BoxesByAddress api expected to have items');
    const ergoBoxes = await Promise.all(
      boxes.items.map(async (box) => await this.convertToErgoBox(box))
    );
    return { boxes: ergoBoxes, hasNextBatch: boxes.items.length > 0 };
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
