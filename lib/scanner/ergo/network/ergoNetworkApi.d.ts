import * as wasm from 'ergo-lib-wasm-nodejs';
import { AbstractNetworkConnector, Block } from '../../../interfaces';
export declare class ErgoNetworkApi extends AbstractNetworkConnector<wasm.Transaction> {
    private readonly url;
    private readonly timeout;
    private node;
    constructor(url: string, timeout: number);
    getBlockAtHeight: (height: number) => Promise<Block>;
    getCurrentHeight: () => Promise<number>;
    getBlockTxs: (blockHash: string) => Promise<Array<wasm.Transaction>>;
}
