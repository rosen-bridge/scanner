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

  getBlockTxs = (blockHash: string): Promise<Array<Transaction>> => {
    return this.client.v1.getApiV1BlocksP1(blockHash).then((block) => {
      const transactions = block.block.blockTransactions || [];
      return transactions.map(this.convertToTransaction);
    });
  };

  getCurrentHeight = (): Promise<number> => {
    return this.client.v1
      .getApiV1Blocks({ limit: 1 })
      .then((headers) => headers.total);
  };
}

export default ErgoExplorerNetwork;
