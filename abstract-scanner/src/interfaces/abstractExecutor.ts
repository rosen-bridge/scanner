export abstract class AbstractExecutor<TxT>{
    abstract id: number;

    abstract processTransactions(txs: Array<TxT>): Promise<boolean>;
}
