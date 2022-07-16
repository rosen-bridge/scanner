export abstract class AbstractExecutor<TxT>{
    abstract _id: number;

    abstract processTransactions(txs: TxT): Promise<Boolean>;
}