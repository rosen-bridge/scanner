import axios from "axios";
import { AbstractNetworkConnector } from "../../../interfaces";
export class KoiosNetwork extends AbstractNetworkConnector {
    url;
    timeout;
    koios;
    constructor(url, timeout) {
        super();
        this.url = url;
        this.timeout = timeout;
        this.koios = axios.create({
            baseURL: this.url,
            timeout: this.timeout,
            headers: { "Content-Type": "application/json" }
        });
    }
    getBlockAtHeight = (height) => {
        return this.koios.get('/blocks', { params: { block_height: `eq.${height}`, select: 'hash,block_height' } }).then(res => {
            const hash = res.data[0].hash;
            return this.koios.get('block_info', { params: { _block_hashes: [hash] } }).then(info => {
                const row = info.data[0];
                return {
                    hash: row.hash,
                    blockHeight: row.block_height,
                    parentHash: row.parent_hash
                };
            }).catch(exp => {
                console.log(exp);
                throw exp;
            });
        }).catch(exp => {
            console.log(exp);
            throw exp;
        });
    };
    getCurrentHeight = () => {
        return this.koios.get('/blocks', { params: { offset: 0, limit: 1, select: 'hash,block_height' } }).then(res => res.data[0].block_height).catch(exp => {
            console.log(exp);
            throw exp;
        });
    };
    getBlockTxs = (blockHash) => {
        return this.koios.get('/block_txs', { params: { _block_hash: blockHash } }).then(res => {
            return this.koios.get('/tx_info', { params: { _tx_hashes: res.data[0].tx_hash } }).then(ret => ret.data);
        }).catch(exp => {
            console.log(exp);
            throw exp;
        });
    };
}
