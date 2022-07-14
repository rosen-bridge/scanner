import * as wasm from "ergo-lib-wasm-nodejs";

export interface ScannerConfig{
    explorerUrl: string;
    nodeUrl: string;
    explorerTimeout: number;
    nodeTimeout: number;
    networkType: wasm.NetworkPrefix;
    watcherAddress: string;
    RWTId: string;
    repoNFT: string;
    interval: number;
    commitmentInitialHeight: number;
    heightLimit: number;
    cleanupConfirmation: number;
}

export type rosenConfigType = {
    RSN: string;
    minBoxValue: string;
    fee: string;
    guardNFT: string;
    cleanupNFT: string;
    cleanupConfirm: number;
    watcherPermitAddress: string;
    RWTRepoAddress: string;
    repoNFTID: string,
    fraudAddress: string;
    eventTriggerAddress: string;
    commitmentAddress: string;
}
