import { AbstractNetworkConnector, Block } from '../../../interfaces';
import ergoNodeClientFactory, {
  ErgoTransaction,
} from '@rosen-clients/ergo-node';
import { Transaction } from './types';

class ErgoNodeNetwork extends AbstractNetworkConnector<Transaction> {
  private client: ReturnType<typeof ergoNodeClientFactory>;
  constructor(nodeUrl: string) {
    super();
    this.client = ergoNodeClientFactory(nodeUrl);
  }
  getBlockAtHeight = (height: number): Promise<Block> => {
    return this.client
      .getChainSlice({
        fromHeight: height,
        toHeight: height,
      })
      .then((blocks) => {
        const block = blocks[0];
        return {
          hash: block.id,
          blockHeight: block.height,
          parentHash: block.parentId,
          timestamp: Number(block.timestamp),
        };
      });
  };

  private convertNodeTransactionToTransaction = (
    tx: ErgoTransaction
  ): Transaction => {
    return {
      id: tx.id || '',
      outputs: tx.outputs.map((output) => ({
        transactionId: output.transactionId || '',
        index: output.index || 0,
        value: output.value || 0n,
        ergoTree: output.ergoTree || '',
        creationHeight: output.creationHeight || 0,
        assets: output.assets || [],
        additionalRegisters: output.additionalRegisters,
        boxId: output.boxId || '',
      })),
      inputs: tx.inputs,
      dataInputs: tx.dataInputs,
    };
  };

  getBlockTxs = (blockHash: string): Promise<Array<Transaction>> => {
    return this.client.getBlockTransactionsById(blockHash).then((res) => {
      return res.transactions.map(this.convertNodeTransactionToTransaction);
    });
  };

  getCurrentHeight = (): Promise<number> => {
    return this.client.getNodeInfo().then((info) => info.fullHeight || 0);
  };
}

export default ErgoNodeNetwork;
