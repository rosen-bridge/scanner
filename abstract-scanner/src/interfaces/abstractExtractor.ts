export abstract class AbstractExtractor<TxT>{
    abstract id: string;

    abstract processTransactions(txs: Array<TxT>): Promise<boolean>;
}
