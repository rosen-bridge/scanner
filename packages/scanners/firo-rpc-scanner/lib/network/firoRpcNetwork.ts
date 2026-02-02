import { randomBytes } from 'crypto';

import {
  AbstractNetworkConnector,
  Block,
} from '@rosen-bridge/scanner-interfaces';
import axios, { Axios } from '@rosen-clients/rate-limited-axios';

import { FiroRpcBlock, FiroRpcTransaction, JsonRpcResult } from '../types';

class FiroRpcNetwork extends AbstractNetworkConnector<FiroRpcTransaction> {
  private readonly url: string;
  private readonly timeout: number;
  private client: Axios;

  constructor(
    url: string,
    timeout: number,
    auth?: {
      username: string;
      password: string;
    },
  ) {
    super();

    // Create axios instance with compression headers explicitly disabled
    this.url = url;
    this.timeout = timeout;
    this.client = axios.create({
      baseURL: this.url,
      timeout: this.timeout,
      headers: { 'Content-Type': 'application/json' },
      auth: auth,
    });
  }

  private generateRandomId = () => randomBytes(32).toString('hex');

  // ----------------------- Required Functions (AbstractNetworkConnector) -----------------------

  /**
   * Returns block at height
   * @param height
   * @returns Block
   */
  getBlockAtHeight = async (height: number): Promise<Block> => {
    try {
      const blockHashResponse = await this.makeRpcCall<string>('getblockhash', [
        height,
      ]);
      const firoBlock = await this.getBlockInfo(blockHashResponse);

      // Convert to abstract Block format
      return {
        hash: firoBlock.hash,
        height: firoBlock.height,
        parentHash: firoBlock.previousblockhash || '',
        txCount: firoBlock.tx.length,
        timestamp: firoBlock.time,
      };
    } catch (error) {
      throw new Error(`Failed to get block at height ${height}: ${error}`);
    }
  };

  /**
   * Returns current network height
   * @returns Current height
   */
  getCurrentHeight = async (): Promise<number> => {
    try {
      return await this.makeRpcCall<number>('getblockcount', []);
    } catch (error) {
      throw new Error(`Failed to get current height: ${error}`);
    }
  };

  /**
   * Return transactions in a block with specified hash (required by AbstractNetworkConnector)
   * @param blockHash
   * @returns
   */
  getBlockTxs = async (
    blockHash: string,
  ): Promise<Array<FiroRpcTransaction>> => {
    try {
      const blockResponse = await this.getBlockInfo(blockHash);

      const txids: Array<string> = blockResponse.tx;
      const transactions: Array<FiroRpcTransaction> = [];

      // Get detailed transaction data for each transaction ID
      for (const txId of txids) {
        try {
          const txResponse = await this.getTransaction(txId);
          transactions.push(txResponse);
        } catch (error) {
          console.warn(`Failed to fetch transaction ${txId}: ${error}`);
        }
      }

      return transactions;
    } catch (error) {
      throw new Error(
        `Failed to get block transactions for ${blockHash}: ${error}`,
      );
    }
  };

  // ----------------------- Custom Functions -----------------------

  /**
   * Return block info with a specified hash
   * @param blockHash
   * @returns FiroRpcBlock
   */
  getBlockInfo = async (blockHash: string): Promise<FiroRpcBlock> => {
    try {
      const block = await this.makeRpcCall<FiroRpcBlock>('getblock', [
        blockHash,
        true,
      ]);

      return block;
    } catch (error) {
      throw new Error(`Failed to get block info for ${blockHash}: ${error}`);
    }
  };

  /**
   * Return transactions ids in a block with specified hash
   * @param blockHash
   * @returns
   */
  getBlockTxIds = async (blockHash: string): Promise<Array<string>> => {
    try {
      const blockInfo = await this.getBlockInfo(blockHash);
      return blockInfo.tx;
    } catch (error) {
      throw new Error(
        `Failed to get block transaction IDs for ${blockHash}: ${error}`,
      );
    }
  };

  /**
   * Return transaction info with specified transaction ID
   * @param txId
   * @returns
   */
  getTransaction = async (txId: string): Promise<FiroRpcTransaction> => {
    try {
      const transaction = await this.makeRpcCall<FiroRpcTransaction>(
        'getrawtransaction',
        [txId, true],
      );
      return transaction;
    } catch (error) {
      throw new Error(`Failed to get transaction ${txId}: ${error}`);
    }
  };

  /**
   * Make RPC call using axios with 503 error handling
   * @param method RPC method name
   * @param params RPC method parameters
   * @returns RPC response
   */
  private makeRpcCall = async <T>(
    method: string,
    params: Array<unknown> = [],
  ): Promise<T> => {
    const randomId = this.generateRandomId();
    try {
      const response = await this.client.post<JsonRpcResult<T>>('', {
        method,
        params,
        id: randomId,
      });

      if (response.data.id !== randomId) {
        throw new Error(
          `Request and response id are different ['${randomId}' != '${response.data.id}']`,
        );
      }

      return response.data.result;
    } catch (error: unknown) {
      const baseError = `Failed to make RPC call [${method}]: `;
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data: unknown } };
        throw new Error(baseError + JSON.stringify(axiosError.response?.data));
      } else if (error && typeof error === 'object' && 'request' in error) {
        const requestError = error as { message?: string };
        throw new Error(baseError + (requestError.message || 'Request failed'));
      } else {
        const genericError = error as { message?: string };
        throw new Error(baseError + (genericError.message || 'Unknown error'));
      }
    }
  };
}

export { FiroRpcNetwork };
