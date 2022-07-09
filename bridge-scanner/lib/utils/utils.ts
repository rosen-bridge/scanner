import * as wasm from "ergo-lib-wasm-nodejs";


export const decodeStr = async (str: string): Promise<string> => {
    return Buffer.from(wasm.Constant.decode_from_base16(str).to_byte_array()).toString('hex')
}
export const decodeCollColl = async (str: string): Promise<Uint8Array[]> => {
    return wasm.Constant.decode_from_base16(str).to_coll_coll_byte()
}

export const ergoTreeToBase58Address = (ergoTree: wasm.ErgoTree,
                                        networkType: wasm.NetworkPrefix = wasm.NetworkPrefix.Mainnet): string => {
    return ergoTreeToAddress(ergoTree).to_base58(networkType)
}

export const ergoTreeToAddress = (ergoTree: wasm.ErgoTree): wasm.Address => {
    return wasm.Address.recreate_from_ergo_tree(ergoTree)
}

export const uint8ArrayToHex = (buffer: Uint8Array): string => {
    return Buffer.from(buffer).toString('hex');
}
