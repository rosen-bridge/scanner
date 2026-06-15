import {
  AbstractNetworkConnector,
  Block,
} from '@rosen-bridge/scanner-interfaces';

import { FiroRpcTransaction } from '../types';
import { ElectrumXSocket } from './electrumXSocket';
import { parseBlockHeader, parseTransaction } from './parsers';
import { BlockchainHeaderSubscribeResult } from './types';

export class FiroElectrumXNetwork
  extends ElectrumXSocket
  implements AbstractNetworkConnector<FiroRpcTransaction>
{
  constructor(
    host: string,
    port: number,
    reconnectDelay?: number,
    timeout?: number,
  ) {
    super(host, port, reconnectDelay, timeout);
  }

  /**
   * get current height for blockchain
   */
  getCurrentHeight = async (): Promise<number> => {
    const response = await this.sendRequest<BlockchainHeaderSubscribeResult>(
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
    const response = await this.sendRequest<string>('blockchain.block.header', [
      height,
    ]);
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
    const txIds = await this.sendRequest<string[]>('blockchain.block.txids', [
      height,
    ]);

    // 2. Fetch each transaction hex and parse it
    const transactions: Array<FiroRpcTransaction> = [];
    for (const txId of txIds) {
      const hex = await this.sendRequest<string>('blockchain.transaction.get', [
        txId,
        false,
      ]);
      const tx = parseTransaction(hex);
      transactions.push({ ...tx, txid: txId, hash: txId });
    }

    return transactions;
  };
}
