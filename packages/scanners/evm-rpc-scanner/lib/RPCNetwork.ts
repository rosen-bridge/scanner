import { AbstractNetworkConnector, Block } from '@rosen-bridge/scanner';
import { RPCTransaction, BlockNotFound } from './types';
import { JsonRpcProvider } from 'ethers';
import { rpcClientFactory } from './api';

export class RPCNetwork extends AbstractNetworkConnector<RPCTransaction> {
  protected readonly provider: JsonRpcProvider;

  constructor(url: string, timeout?: number, authToken?: string) {
    super();
    this.provider = rpcClientFactory.generate(url, authToken);
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
    return this.provider
      .getBlock(height)
      .then((block) => {
        if (block == undefined) {
          throw new BlockNotFound(`Block with height ${height} is not found.`);
        }
        if (block['hash'] == undefined) {
          throw new Error('no block hash!');
        }

        return {
          hash: block['hash'],
          blockHeight: block['number'],
          parentHash: block['parentHash'],
          timestamp: block['timestamp'],
          txCount: block.length,
        };
      })
      .catch((exp) => {
        throw exp;
      });
  };

  /**
   * Returns current network height
   * @returns current height
   */
  getCurrentHeight = (): Promise<number> => {
    return this.provider
      .getBlockNumber()
      .then((number) => {
        return number;
      })
      .catch((exp) => {
        throw exp;
      });
  };

  /**
   * Return transactions in a block with specified hash
   * @param blockHash
   * @returns array of RPCTransaction
   */
  getBlockTxs = (blockHash: string): Promise<Array<RPCTransaction>> => {
    return this.provider
      .getBlock(blockHash, true)
      .then((block) => {
        if (block == undefined) {
          throw new BlockNotFound(`Block with hash ${blockHash} is not found.`);
        }
        return block.prefetchedTransactions.filter((tx) => tx.isMined()); // Not sure why tx shouldn't be mined already !
      })
      .catch((exp) => {
        throw exp;
      });
  };
}
