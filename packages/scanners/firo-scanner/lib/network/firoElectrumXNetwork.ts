import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import {
  AbstractNetworkConnector,
  Block,
} from '@rosen-bridge/scanner-interfaces';

import { FiroRpcTransaction } from '../types';
import { ElectrumXSocket } from './electrumXSocket';
import { parseBlockHeader, parseTransaction } from './parsers';
import { BlockchainHeaderSubscribeResult } from './types';

export class FiroElectrumXNetwork extends AbstractNetworkConnector<FiroRpcTransaction> {
  protected client: ElectrumXSocket;

  constructor(
    host: string,
    port: number,
    reconnectDelay?: number,
    timeout?: number,
    logger: AbstractLogger = new DummyLogger(),
    useTls = true,
  ) {
    super();
    this.client = new ElectrumXSocket(
      host,
      port,
      reconnectDelay,
      timeout,
      logger.child('electrumXSocket'),
      useTls,
    );
  }

  /**
   * setups the underlying ElectrumXSocket
   *
   * Note that this function should be called before any other functions.
   */
  setupSocket = (): void => this.client.setupSocket();

  /**
   * disconnects the underlying ElectrumXSocket
   */
  disconnect = (): void => this.client.disconnect();

  /**
   * get current height for blockchain
   */
  getCurrentHeight = async (): Promise<number> => {
    const response =
      await this.client.sendRequest<BlockchainHeaderSubscribeResult>(
        'blockchain.headers.subscribe',
        [],
      );
    return response.height;
  };

  /**
   * get block header by height
   * @param height
   */
  getBlockAtHeight = async (height: number): Promise<Block> => {
    const response = await this.client.sendRequest<string>(
      'blockchain.block.header',
      [height],
    );
    const block = parseBlockHeader(response);
    return {
      ...block,
      height: height,
    };
  };

  /**
   * get block transactions by block hash and height
   * @param blockHash
   * @param height
   */
  getBlockTxs = async (
    blockHash: string,
    height: number,
  ): Promise<Array<FiroRpcTransaction>> => {
    // 1. Get all txids in the block
    const txIds = await this.client.sendRequest<string[]>(
      'blockchain.block.txids',
      [height],
    );

    // 2. Fetch each transaction hex and parse it
    const transactions: Array<FiroRpcTransaction> = [];
    for (const txId of txIds) {
      const hex = await this.client.sendRequest<string>(
        'blockchain.transaction.get',
        [txId, false],
      );
      const tx = parseTransaction(hex);
      transactions.push({ ...tx, txid: txId, hash: txId });
    }

    return transactions;
  };
}
