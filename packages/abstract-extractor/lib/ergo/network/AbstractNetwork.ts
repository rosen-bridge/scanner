import { ErgoBox } from '../interfaces';

export abstract class AbstractNetwork {
  /**
   * return related boxes by specified address with limit offset
   * @param address
   * @param offset
   * @param limit
   * @returns related boxes
   */
  abstract getBoxesByAddress: (
    address: string,
    offset: number,
    limit: number
  ) => Promise<{ boxes: ErgoBox[]; hasNextBatch: boolean }>;

  /**
   * return related boxes by specified token with limit offset
   * @param tokenId
   * @param offset
   * @param limit
   * @returns related boxes
   */
  abstract getBoxesByTokenId: (
    tokenId: string,
    offset: number,
    limit: number
  ) => Promise<{ boxes: ErgoBox[]; hasNextBatch: boolean }>;
}
