import { AbstractNetworkConnector, Block } from '../../../interfaces';
import { RPCTransaction } from '../interfaces/rpc';
import { JsonRpcProvider } from 'ethers';

export class RPCNetwork extends AbstractNetworkConnector<RPCTransaction> {
  private readonly url: string;
  private readonly timeout: number;
  private readonly provider: JsonRpcProvider;

  constructor(url: string, timeout: number, authToken?: string) {
    super();
    this.url = url;
    this.timeout = timeout;
    this.provider = authToken
      ? new JsonRpcProvider(`${url}/${authToken}`)
      : new JsonRpcProvider(`${url}`);
    this.provider._getConnection().timeout = 600;
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
          throw new Error("Block doesn't exist.");
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
          throw new Error("Block doesn't exist.");
        }
        return block.prefetchedTransactions
          .filter((tx) => tx.isMined()) // Not sure why tx shouldn't be mined already !
          .map((tx) => {
            return {
              tx_hash: tx.hash,
              block_hash: tx.blockHash,
              block_height: tx.blockNumber,
              tx_block_index: tx.index,
              value: tx.value,
              fee: {
                gas_limit: tx.gasLimit,
                gas_price: tx.gasPrice,
                maxPriorityFeePerGas: tx.maxPriorityFeePerGas,
                maxFeePerGas: tx.maxFeePerGas,
              },
              nonce: tx.nonce,
              type: tx.type,
              from: tx.from,
              to: tx.to,
              input_data: tx.data,
            };
          });
      })
      .catch((exp) => {
        throw exp;
      });
  };
}
