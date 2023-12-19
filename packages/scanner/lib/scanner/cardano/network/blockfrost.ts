import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import { AbstractNetworkConnector, Block } from '../../../interfaces';
import {
  BlockFrostNullValueError,
  BlockFrostTransaction,
} from '../interfaces/BlockFrost';

export class BlockFrostNetwork extends AbstractNetworkConnector<BlockFrostTransaction> {
  private client: BlockFrostAPI;

  constructor(projectId: string, timeout: number, url?: string) {
    super();
    this.client = new BlockFrostAPI({
      projectId: projectId,
      customBackend: url,
      network: 'mainnet',
    });
  }

  /**
   * get block header from height
   * @param height
   */
  getBlockAtHeight = async (height: number): Promise<Block> => {
    return this.client
      .blocks(height)
      .then((res) => {
        if (!res.height || !res.previous_block)
          throw new BlockFrostNullValueError(
            `Block height or previous_block is null`
          );
        return {
          hash: res.hash,
          blockHeight: res.height,
          parentHash: res.previous_block,
          timestamp: res.time,
        };
      })
      .catch((exp) => {
        throw exp;
      });
  };

  /**
   * get current height for blockchain
   */
  getCurrentHeight = async (): Promise<number> => {
    return this.client
      .blocksLatest()
      .then((block) => {
        const height = block.height;
        if (height) return height;
        throw new BlockFrostNullValueError('Height of last block is null');
      })
      .catch((exp) => {
        throw exp;
      });
  };

  /**
   * Try getting transactions information.
   * @param txHashes
   */
  getTxInformation = async (txId: string): Promise<BlockFrostTransaction> => {
    const txUtxos = await this.client.txsUtxos(txId);
    const txMetadata = await this.client.txsMetadata(txId);

    return {
      utxos: txUtxos,
      metadata: txMetadata,
    };
  };

  /**
   * fetch list of transaction for a specific block
   * @param blockId
   */
  getBlockTxs = async (
    blockId: string
  ): Promise<Array<BlockFrostTransaction>> => {
    const blockTxIds = await this.client.blocksTxsAll(blockId);

    const blockTxs = [];
    for (const txId of blockTxIds) {
      blockTxs.push(await this.getTxInformation(txId));
    }

    return blockTxs;
  };
}
