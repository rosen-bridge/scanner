import axios from "axios";
import { NodeBlock, NodeTransaction } from "./ergoApiModels";
import { ErgoConfig } from "../config/config";
import { AbstractNetworkConnector, Block } from "blockchain-scanner/dist/lib";

const ergoConfig = ErgoConfig.getConfig();

export const nodeApi = axios.create({
    baseURL: ergoConfig.nodeUrl,
    timeout: ergoConfig.nodeTimeout
})

export class ErgoNetworkApi extends AbstractNetworkConnector{
    getBlockAtHeight = (height: number): Promise<Block> => {
        return nodeApi.get<Array<{ id: string }>>(
            `/blocks/chainSlice`, {params: {fromHeight: height - 2, toHeight: height}}
        ).then(
            res => {
                return {
                    hash: res.data[1].id,
                    block_height: height,
                    parent_hash: res.data[0].id,
                }
            }
        )
    }

    getCurrentHeight = (): Promise<number> => {
        return nodeApi.get<{ fullHeight: number }>(
            `/info`
        ).then(
            res => {
                return res.data.fullHeight
            }
        )
    }

    getBlockTxs = (blockHash: string): Promise<NodeTransaction[]> => {
        return nodeApi.get<NodeBlock>(
            `/blocks/${blockHash}/transactions`
        ).then(res => {
            return res.data.transactions
        })
    }
}
