import * as wasm from 'ergo-lib-wasm-nodejs';
import { AbstractNetworkConnector } from '../../../interfaces';
import axios from "axios";
export class ErgoNetworkApi extends AbstractNetworkConnector {
    url;
    timeout;
    node;
    constructor(url, timeout) {
        super();
        this.url = url;
        this.timeout = timeout;
        this.node = axios.create({
            baseURL: this.url,
            timeout: this.timeout
        });
    }
    getBlockAtHeight = (height) => {
        return this.node.get(`/blocks/chainSlice`, { params: { fromHeight: height - 2, toHeight: height } }).then(res => {
            return {
                hash: res.data[1].id,
                blockHeight: height,
                parentHash: res.data[0].id,
            };
        });
    };
    getCurrentHeight = () => {
        return this.node.get(`/info`).then(res => {
            return res.data.fullHeight;
        });
    };
    getBlockTxs = (blockHash) => {
        return this.node.get(`/blocks/${blockHash}/transactions`).then(res => {
            return res.data.transactions.map(item => wasm.Transaction.from_json(JSON.stringify(item)));
        });
    };
}
