import axios, { AxiosInstance } from "axios";
import { AbstractNetworkConnector, Block } from "../../../interfaces";
import { KoiosBlock, KoiosBlockInfo, KoiosTransaction } from "../interfaces/Koios";

export class KoiosNetwork extends AbstractNetworkConnector<KoiosTransaction>{
    private readonly url: string;
    private readonly timeout: number;
    private koios: AxiosInstance;

    constructor(url: string, timeout: number) {
        super();
        this.url = url;
        this.timeout = timeout
        this.koios = axios.create({
            baseURL: this.url,
            timeout: this.timeout,
            headers: {"Content-Type": "application/json"}
        });
    }

    getBlockAtHeight = (height: number): Promise<Block> => {
        return this.koios.get<Array<KoiosBlock>>(
            '/blocks',
            {params: {block_height: `eq.${height}`, select: 'hash,block_height'}}
        ).then(res => {
            const hash = res.data[0].hash
            return this.koios.post<Array<KoiosBlockInfo>>(
                'block_info',
                {_block_hashes: [hash]}
            ).then(info => {
                const row = info.data[0]
                return {
                    hash: row.hash,
                    blockHeight: row.block_height,
                    parentHash: row.parent_hash
                }
            }).catch(exp => {
                console.log(exp);
                throw exp;
            })
        }).catch(exp => {
            console.log(exp)
            throw exp
        })
    }

    getCurrentHeight = (): Promise<number> => {
        return this.koios.get<Array<KoiosBlock>>(
            '/blocks',
            {params: {offset: 0, limit: 1, select: 'hash,block_height'}}
        ).then(
            res => res.data[0].block_height
        ).catch(exp => {
            console.log(exp)
            throw exp
        })
    }

    getBlockTxs = (blockHash: string): Promise<Array<KoiosTransaction>> => {
        return this.koios.get<Array<{ tx_hash: string }>>(
            '/block_txs',
            {params: {_block_hash: blockHash}}
        ).then(res => {
            if (res.data.length === 0) {
                return []
            } else {
                return this.koios.post<Array<KoiosTransaction>>(
                    '/tx_info',
                    {_tx_hashes: res.data.map(obj => obj.tx_hash)}
                ).then(ret => {
                    return ret.data
                })
            }
        }).catch(exp => {
            console.log(exp)
            throw exp
        })
    }

}
