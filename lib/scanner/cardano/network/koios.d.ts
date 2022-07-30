import { AbstractNetworkConnector, Block } from "../../../interfaces";
import { KoiosTransaction } from "../interfaces/Koios";
export declare class KoiosNetwork extends AbstractNetworkConnector<KoiosTransaction> {
    private readonly url;
    private readonly timeout;
    private koios;
    constructor(url: string, timeout: number);
    getBlockAtHeight: (height: number) => Promise<Block>;
    getCurrentHeight: () => Promise<number>;
    getBlockTxs: (blockHash: string) => Promise<Array<KoiosTransaction>>;
}
