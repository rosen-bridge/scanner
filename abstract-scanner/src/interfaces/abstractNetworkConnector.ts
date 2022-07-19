import { Block } from "./block";

export abstract class AbstractNetworkConnector<TransactionType> {
    abstract getBlockAtHeight(height: number): Promise<Block>;

    abstract getCurrentHeight(): Promise<number>;

    abstract getBlockTxs(blockHash: string): Promise<Array<TransactionType>>;
}
