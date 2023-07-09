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
  getBlockAtHeight = (height: number): Promise<Block> => {
    return this.client.v0.getApiV0BlocksAtP1(height).then((res) => {
      return this.client.v1.getApiV1BlocksP1(res[0]).then((blocks) => ({
        parentHash: blocks.block.header.parentId,
        blockHeight: blocks.block.header.height,
        timestamp: Number(blocks.block.header.timestamp),
        hash: blocks.block.header.id,
      }));
    });
  };

  /**
   * convert Explorer transaction to scanner transaction type
   * @param tx
   */
  private convertToTransaction = (tx: TransactionInfo1): Transaction => {
    return {
      id: tx.id,
      dataInputs: tx.dataInputs
        ? tx.dataInputs.map((dataInput) => ({
            boxId: dataInput.id,
          }))
        : [],
      inputs: tx.inputs ? tx.inputs.map((input) => ({ boxId: input.id })) : [],
      outputs: tx.outputs
        ? tx.outputs.map((output) => ({
            boxId: output.id,
            transactionId: output.txId,
            additionalRegisters: output.additionalRegisters,
            assets: output.assets || [],
            ergoTree: output.ergoTree,
            creationHeight: output.creationHeight,
            index: output.index,
            value: output.value,
          }))
        : [],
    };
  };

  /**
   * get list of all block transactions
   * @param blockHash
   */
  getBlockTxs = (blockHash: string): Promise<Array<Transaction>> => {
    return this.client.v1.getApiV1BlocksP1(blockHash).then((block) => {
      const transactions = block.block.blockTransactions || [];
      return transactions.map(this.convertToTransaction);
    });
  };

  /**
   * get current height of blockchain
   */
  getCurrentHeight = (): Promise<number> => {
    return this.client.v1
      .getApiV1Networkstate()
      .then((res) => Number(res.height));
  };
}

export default ErgoExplorerNetwork;
