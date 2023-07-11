import { TransactionInfo1 } from '@rosen-clients/ergo-explorer/dist/src/v1/types';
import { AbstractNetworkConnector, Block } from '../../../interfaces';
import { Transaction } from './types';
import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';

class ErgoExplorerNetwork extends AbstractNetworkConnector<Transaction> {
  private client: ReturnType<typeof ergoExplorerClientFactory>;

  constructor(explorerUrl: string) {
    super();
    this.client = ergoExplorerClientFactory(explorerUrl);
  }

  /**
   * get block at height.
   * @param height
   */
  getBlockAtHeight = async (height: number): Promise<Block> => {
    const blockIds = await this.client.v0.getApiV0BlocksAtP1(height);
    const blockSummary = await this.client.v1.getApiV1BlocksP1(blockIds[0]);
    return {
      parentHash: blockSummary.block.header.parentId,
      blockHeight: blockSummary.block.header.height,
      timestamp: Number(blockSummary.block.header.timestamp),
      hash: blockSummary.block.header.id,
    };
  };

  /**
   * convert Explorer transaction to scanner transaction type
   * @param tx
   */
  private convertToTransaction = (tx: TransactionInfo1): Transaction => {
    return {
      id: tx.id,
      dataInputs:
        tx.dataInputs?.map((dataInput) => ({
          boxId: dataInput.id,
        })) ?? [],
      inputs: tx.inputs?.map((input) => ({ boxId: input.id })) ?? [],
      outputs:
        tx.outputs?.map((output) => ({
          boxId: output.id,
          transactionId: output.txId,
          additionalRegisters: output.additionalRegisters,
          assets: output.assets || [],
          ergoTree: output.ergoTree,
          creationHeight: output.creationHeight,
          index: output.index,
          value: output.value,
        })) ?? [],
    };
  };

  /**
   * get list of all block transactions
   * @param blockHash
   */
  getBlockTxs = async (blockHash: string): Promise<Array<Transaction>> => {
    const block = await this.client.v1.getApiV1BlocksP1(blockHash);
    const transactions = block.block.blockTransactions || [];
    return transactions.map(this.convertToTransaction);
  };

  /**
   * get current height of blockchain
   */
  getCurrentHeight = async (): Promise<number> => {
    const networkState = await this.client.v1.getApiV1Networkstate();
    return Number(networkState.height);
  };
}

export default ErgoExplorerNetwork;
