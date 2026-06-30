import { randomBytes } from 'crypto';

import {
  AbstractNetworkConnector,
  Block,
} from '@rosen-bridge/scanner-interfaces';
import axios, { Axios } from '@rosen-clients/rate-limited-axios';

import {
  FiroRpcBlock,
  FiroRpcBlockWithTransactions,
  FiroRpcTransaction,
  JsonRpcResult,
} from '../types';

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
      const blockResponse =
        await this.makeRpcCall<FiroRpcBlockWithTransactions>('getblock', [
          blockHash,
          2,
        ]);

      return blockResponse.tx;
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
      const genericError = error as { message?: string };
      throw new Error(baseError + (genericError.message || 'Unknown error'));
    }
  };
}

export { FiroRpcNetwork };
