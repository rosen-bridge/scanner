import axios, { AxiosInstance } from "axios";
import { Tx, TxMetaData, Utxo } from "./apiModels";
import { AbstractNetworkConnector, Block } from "blockchain-scanner/dist/lib";
import { ScannerConfig } from "../config/interface";

export class KoiosNetwork extends AbstractNetworkConnector{
    _config: ScannerConfig;
    _koios: AxiosInstance;

    constructor(config: ScannerConfig, koiosAxiosInstance?: AxiosInstance) {
        super();
        this._config = config;
        if (koiosAxiosInstance === undefined) {
            this._koios = axios.create({
                baseURL: this._config.node.URL,
                timeout: this._config.timeout,
                headers: {"Content-Type": "application/json"}
            });
        } else {
            this._koios = koiosAxiosInstance;
        }
    }

    getBlockAtHeight = async (height: number): Promise<Block> => {
        const currentBlock = await this._koios.get<Array<Block>>(
            '/blocks',
            {params: {block_height: `eq.${height}`, select: 'hash,block_height'}}
        ).then(
            res => res.data[0]
        );
        const parentBlock = await this._koios.get<Array<Block>>(
            '/blocks',
            {params: {block_height: `eq.${height - 1}`, select: 'hash,block_height'}}
        ).then(
            res => res.data[0]
        );
        return {hash: currentBlock.hash, block_height: currentBlock.block_height, parent_hash: parentBlock.hash}
    }

    getCurrentHeight = (): Promise<number> => {
        return this._koios.get<Array<Block>>(
            '/blocks',
            {params: {offset: 0, limit: 1, select: 'hash,block_height'}}
        ).then(
            res => res.data[0].block_height
        )
    }

    getBlockTxs = (blockHash: string): Promise<string[]> => {
        return this._koios.get<Array<{ tx_hash: string }>>(
            '/block_txs',
            {params: {_block_hash: blockHash}}
        ).then(res => {
            return res.data.map((item: { tx_hash: string }) => {
                return item.tx_hash
            })
        })
    }

    getTxUtxos = (txHashes: Array<string>): Promise<Array<Tx>> => {
        return this._koios.post<Array<{ outputs: Array<Utxo> }>>(
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
        return this._koios.post<Array<TxMetaData>>("/tx_metadata", {"_tx_hashes": txHashes}).then(
            res => res.data
        )
    }
}

