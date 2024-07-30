import { AbstractNetworkConnector, Block } from '@rosen-bridge/scanner';
import { BlockNotFound } from './types';
import { JsonRpcProvider, TransactionResponse } from 'ethers';

export class RpcNetwork extends AbstractNetworkConnector<TransactionResponse> {
  protected readonly provider: JsonRpcProvider;

  constructor(url: string, timeout?: number, authToken?: string) {
    super();
    this.provider = authToken
      ? new JsonRpcProvider(`${url}/${authToken}`)
      : new JsonRpcProvider(`${url}`);
    if (timeout) {
      this.provider._getConnection().timeout = timeout;
    }
  }

  /**
   * Returns block at height
   * @param height
   * @returns Block
   */
  getBlockAtHeight = (height: number): Promise<Block> => {
    return this.provider.getBlock(height).then((block) => {
      if (block == undefined) {
        throw new BlockNotFound(`Block with height ${height} is not found.`);
      }
      if (block.hash == undefined) {
        throw new Error('no block hash!');
      }

      return {
        hash: block.hash,
        blockHeight: block.number,
        parentHash: block.parentHash,
        timestamp: block.timestamp,
        txCount: block.length,
      };
    });
  };

  /**
   * Returns current network height
   * @returns current height
   */
  getCurrentHeight = (): Promise<number> => {
    return this.provider.getBlockNumber();
  };

  /**
   * Return transactions in a block with specified hash
   * @param blockHash
   * @returns array of RpcTransaction
   */
  getBlockTxs = async (
    blockHash: string
  ): Promise<Array<TransactionResponse>> => {
    const block = await this.provider.getBlock(blockHash, true);
    if (block == undefined) {
      throw new BlockNotFound(`Block with hash ${blockHash} is not found.`);
    }
    return block.prefetchedTransactions;
  };
}
