import { FetchRequest, JsonRpcProvider, TransactionResponse } from 'ethers';

import {
  AbstractNetworkConnector,
  Block,
} from '@rosen-bridge/scanner-interfaces';

import { BlockNotFound } from './types';

export class EvmRpcNetwork extends AbstractNetworkConnector<TransactionResponse> {
  protected readonly provider: JsonRpcProvider;

  constructor(url: string, timeout?: number, authToken?: string) {
    super();
    // Build the connection request first and hand it to the provider:
    // in ethers v6 `_getConnection()` returns a fresh clone of the
    // provider's request on every call, so assigning `timeout` to its
    // result is discarded and the timeout never takes effect. Setting
    // it on the request the provider is constructed with persists,
    // because every clone copies it.
    const connection = new FetchRequest(
      authToken ? `${url}/${authToken}` : `${url}`,
    );
    if (timeout) {
      connection.timeout = timeout;
    }
    this.provider = new JsonRpcProvider(connection);
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
        height: block.number,
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
    blockHash: string,
  ): Promise<Array<TransactionResponse>> => {
    const block = await this.provider.getBlock(blockHash, true);
    if (block == undefined) {
      throw new BlockNotFound(`Block with hash ${blockHash} is not found.`);
    }
    return block.prefetchedTransactions;
  };
}
