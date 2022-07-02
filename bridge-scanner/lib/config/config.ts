import config from "config";

const COMMITMENT_INTERVAL: number | undefined = config.get?.('commitmentScanner.interval');
const COMMITMENT_INITIAL_HEIGHT: number | undefined = config.get?.('commitmentScanner.initialBlockHeight');
const COMMITMENT_HEIGHT_LIMIT: number | undefined = config.get?.('commitmentScanner.heightLimit');
const CLEANUP_CONFIRMATION: number | undefined = config.get?.('commitmentScanner.cleanupConfirmation');
const EXPLORER_URL: string | undefined = config.get?.('ergo.explorerUrl');
const NODE_URL: string | undefined = config.get?.('ergo.nodeUrl');
const ERGO_EXPLORER_TIMEOUT: number | undefined = config.get?.('ergo.explorerTimeout');
const ERGO_NODE_TIMEOUT: number | undefined = config.get?.('ergo.nodeTimeout');
const RWT_ID: string | undefined = config.get?.('ergo.RWTId');


export class ErgoConfig{
    private static instance: ErgoConfig;
    explorerUrl: string;
    nodeUrl: string;
    nodeTimeout: number;
    explorerTimeout: number;
    commitmentInterval: number;
    commitmentInitialHeight: number;
    commitmentHeightLimit: number;
    cleanupConfirmation: number;
    RWTId: string;


    private constructor() {
        if (EXPLORER_URL === undefined) {
            throw new Error("Ergo Explorer Url is not set in the config");
        }
        if (NODE_URL === undefined) {
            throw new Error("Ergo Node Url is not set in the config");
        }
        if (COMMITMENT_INTERVAL === undefined) {
            throw new Error("Commitment scanner interval doesn't set correctly");
        }
        if (COMMITMENT_INITIAL_HEIGHT === undefined) {
            throw new Error("Commitment scanner initial height doesn't set correctly");
        }
        if (COMMITMENT_HEIGHT_LIMIT === undefined) {
            throw new Error("Commitment scanner height limit doesn't set correctly");
        }
        if (CLEANUP_CONFIRMATION === undefined) {
            throw new Error("Clean up doesn't set correctly");
        }
        if (ERGO_EXPLORER_TIMEOUT === undefined) {
            throw new Error("Ergo explorer timeout doesn't set correctly");
        }
        if (ERGO_NODE_TIMEOUT === undefined) {
            throw new Error("Ergo node timeout doesn't set correctly");
        }
        if (RWT_ID === undefined) {
            throw new Error("RWTId doesn't set in config file");
        }

        this.explorerUrl = EXPLORER_URL;
        this.nodeUrl = NODE_URL;
        this.explorerTimeout = ERGO_EXPLORER_TIMEOUT;
        this.nodeTimeout = ERGO_NODE_TIMEOUT;
        this.commitmentInterval = COMMITMENT_INTERVAL;
        this.commitmentInitialHeight = COMMITMENT_INITIAL_HEIGHT;
        this.commitmentHeightLimit = COMMITMENT_HEIGHT_LIMIT;
        this.cleanupConfirmation = CLEANUP_CONFIRMATION;
        this.RWTId = RWT_ID;

    }

    static getConfig() {
        if (!ErgoConfig.instance) {
            ErgoConfig.instance = new ErgoConfig();
        }
        return ErgoConfig.instance;
    }
}
