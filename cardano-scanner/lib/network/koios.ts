import axios from "axios";
import { Tx, TxMetaData, Utxo } from "./apiModels";

import { Config } from "../config/Config";
import { AbstractNetworkConnector, Block } from "blockchain-scanner/dist/lib";

const cardanoConfig = Config.getConfig();
const URL = cardanoConfig.koiosURL;

export const koios = axios.create({
    baseURL: URL,
    timeout: cardanoConfig.timeout,
    headers: {"Content-Type": "application/json"}
});

export class KoiosNetwork extends AbstractNetworkConnector{
    constructor() {
        super();
    }

    getBlockAtHeight = async (height: number): Promise<Block> => {
        const currentBlock = await koios.get<Array<Block>>(
            '/blocks',
            {params: {block_height: `eq.${height}`, select: 'hash,block_height'}}
        ).then(
            res => res.data[0]
        );
        const parentBlock = await koios.get<Array<Block>>(
            '/blocks',
            {params: {block_height: `eq.${height - 1}`, select: 'hash,block_height'}}
        ).then(
            res => res.data[0]
        );
        return {hash: currentBlock.hash, block_height: currentBlock.block_height, parent_hash: parentBlock.hash}
    }

    getCurrentHeight = (): Promise<number> => {
        return koios.get<Array<Block>>(
            '/blocks',
            {params: {offset: 0, limit: 1, select: 'hash,block_height'}}
        ).then(
            res => res.data[0].block_height
        )
    }

    getBlockTxs = (blockHash: string): Promise<string[]> => {
        return koios.get<Array<{ tx_hash: string }>>(
            '/block_txs',
            {params: {_block_hash: blockHash}}
        ).then(res => {
            return res.data.map((item: { tx_hash: string }) => {
                return item.tx_hash
            })
        })
    }

    getTxUtxos = (txHashes: Array<string>): Promise<Array<Tx>> => {
        return koios.post<Array<{ outputs: Array<Utxo> }>>(
            '/tx_utxos', {"_tx_hashes": txHashes}
        ).then(res => {
            return res.data.map((tx: { outputs: Array<Utxo> }) => {
                return {
                    utxos: tx.outputs
                }
            });
        });
    }

    getTxMetaData = (txHashes: Array<string>): Promise<Array<TxMetaData>> => {
        return koios.post<Array<TxMetaData>>("/tx_metadata", {"_tx_hashes": txHashes}).then(
            res => res.data
        )
    }
}

