import axios from "axios";
import * as wasm from "ergo-lib-wasm-nodejs";
import { AddressBoxes, ErgoTx } from "./types";
import { JsonBI } from "./parser";
import { ErgoConfig } from "../config/config";
import { ergoTreeToBase58Address } from "../utils/utils";

const ergoConfig = ErgoConfig.getConfig();

export const explorerApi = axios.create({
    baseURL: ergoConfig.explorerUrl,
    timeout: ergoConfig.nodeTimeout,
});

export class ErgoNetwork{

    /**
     * gets unspent boxes for a specific ergotree with default limit of 100 and offset 0
     * @param tree
     * @param offset
     * @param limit
     */
    static getBoxesForAddress = async (tree: string, offset = 0, limit = 100): Promise<AddressBoxes> => {
        return explorerApi.get<AddressBoxes>(
            `/api/v1/boxes/unspent/byErgoTree/${tree}`,
            {
                params: {offset: offset, limit: limit},
                transformResponse: data => JsonBI.parse(data)
            }
        ).then(
            res => res.data
        );
    }

    /**
     * selects boxes for specific ergoTree that has enough amount of erg and tokens also with filter
     *  for filtering undesired boxes
     * @param tree ergotree of address you want grab boxes from
     * @param amount amount of erg you want to cover
     * @param covering tokens that you want to cover with their count default = {}
     * @param filter filter function call back in case you want to filter out some boxes from covering
     *  default is () => true
     */
    static getCoveringErgAndTokenForAddress = async (
        tree: string,
        amount: bigint,
        covering: { [id: string]: bigint } = {},
        filter: (box: wasm.ErgoBox) => boolean = () => true
    ): Promise<{ covered: boolean, boxes: Array<wasm.ErgoBox> }> => {
        const res: Array<wasm.ErgoBox> = []
        const boxesItems = await this.getBoxesForAddress(tree, 0, 1)
        const total = boxesItems.total;
        let offset = 0;
        const bigIntMax = (a: bigint, b: bigint) => a > b ? a : b;
        const remaining = () => {
            const tokenRemain = Object.entries(covering)
                .map(([, amount]) => bigIntMax(amount, 0n)).reduce(
                    (a, b) => a + b,
                    0n
                );
            return tokenRemain + bigIntMax(amount, 0n) > 0;
        }
        while (offset < total && remaining()) {
            const boxes = await this.getBoxesForAddress(tree, offset, 10);
            const ergoBoxes = wasm.ErgoBoxes.from_boxes_json(boxes.items.map(box => JsonBI.stringify(box).toString()));
            for (let i = 0; i < ergoBoxes.len(); i++) {
                const box = ergoBoxes.get(i);
                if (filter(box)) {
                    res.push(box);
                    amount -= BigInt(box.value().as_i64().to_str());
                    if (box.tokens().len() > 0) {
                        for (let j = 0; j < box.tokens().len(); j++) {
                            const tokenId = box.tokens().get(j).id().to_str();
                            const tokenAmount = BigInt(box.tokens().get(j).amount().as_i64().to_str());
                            if (Object.hasOwnProperty.call(covering, tokenId)) {
                                covering[tokenId] -= tokenAmount;
                            }
                        }
                    }
                    if (!remaining()) break
                }
            }
            offset += 10;
        }
        return {
            boxes: res,
            covered: !remaining()
        }

    }

    /**
     * gets a box with a specific token(NFT)
     * @param address
     * @param tokenId
     */
    static getBoxWithToken = async (address: wasm.Address, tokenId: string): Promise<wasm.ErgoBox> => {
        const box = await this.getCoveringErgAndTokenForAddress(
            address.to_ergo_tree().to_base16_bytes(),
            0n,
            {[tokenId]: 1n},
            box => {
                if (box.tokens().len() === 0) {
                    return false
                }
                let found = false
                for (let i = 0; i < box.tokens().len(); i++) {
                    if (box.tokens().get(i).id().to_str() === tokenId) found = true;
                }
                return found
            }
        )
        if (!box.covered) {
            throw Error("box with Token:" + tokenId + " not found")
        }
        return box.boxes[0]
    }

    /**
     * tracks mempool boxes used for chaining transactions
     * @param box
     */
    static trackMemPool = async (box: wasm.ErgoBox): Promise<wasm.ErgoBox> => {
        const address: string = ergoTreeToBase58Address(box.ergo_tree())
        const memPoolBoxesMap = new Map<string, wasm.ErgoBox>();
        const transactions = await this.getMemPoolTxForAddress(address).then(res => res.items);
        if (transactions !== undefined) {
            transactions.forEach(tx => {
                const inputs = tx.inputs.filter(box => box.address === address);
                const outputs = tx.outputs.filter(box => box.address === address);
                if (inputs.length >= 1 && outputs.length >= 1) {
                    inputs.forEach(input => {
                        memPoolBoxesMap.set(input.boxId, wasm.ErgoBox.from_json(JsonBI.stringify(outputs[0])))
                    });
                }
            });
        }
        let lastBox: wasm.ErgoBox = box
        while (memPoolBoxesMap.has(lastBox.box_id().to_str())) lastBox = memPoolBoxesMap.get(lastBox.box_id().to_str())!
        return lastBox
    }

    /**
     * gets mempool transaction for specific address
     * @param address
     */
    static getMemPoolTxForAddress = async (address: string): Promise<{ items: Array<ErgoTx>, total: number }> => {
        return await explorerApi.get<{ items: Array<ErgoTx>, total: number }>(
            `/api/v1/mempool/transactions/byAddress/${address}`
        ).then(res => res.data)
    }

}
