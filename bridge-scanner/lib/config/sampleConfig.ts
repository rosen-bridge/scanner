import * as wasm from "ergo-lib-wasm-nodejs";

export const sampleScannerConfig = {
    explorerUrl: "http://10.10.9.3:7000",
    nodeUrl: "http://10.10.9.3:9065",
    explorerTimeout: 10000,
    nodeTimeout: 10000,
    networkType: wasm.NetworkPrefix.Mainnet,
    watcherAddress: "9hwWcMhrebk4Ew5pBpXaCJ7zuH8eYkY9gRfLjNP3UeBYNDShGCT",
    RWTId: "3c6cb596273a737c3e111c31d3ec868b84676b7bad82f9888ad574b44edef267",
    repoNFT: "a40b86c663fbbfefa243c9c6ebbc5690fc4e385f15b44c49ba469c91c5af0f48",
    interval: 10,
    commitmentInitialHeight: 208640,
    heightLimit: 100,
    cleanupConfirmation: 10,
}
