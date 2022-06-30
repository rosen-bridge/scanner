import config from "config";

const CARDANO_TIMEOUT: number | undefined = config.get?.('cardano.timeout');
const URL: string | undefined = config.get?.('cardano.node.URL');
const INTERVAL: number | undefined = config.get?.('cardano.interval');
const INITIAL_HEIGHT: number | undefined = config.get?.('cardano.initialBlockHeight');

export class Config{
    private static instance: Config;
    koiosURL: string;
    interval: number;
    timeout: number;
    initialHeight: number;

    private constructor() {

        if (URL === undefined) {
            throw new Error("koios URL is not set config file");
        }
        if (INTERVAL === undefined) {
            throw new Error("Cardano Scanner interval is not set in the config file");
        }
        if (INITIAL_HEIGHT === undefined) {
            throw new Error("Cardano Scanner initial height is not set in the config file");
        }
        if (CARDANO_TIMEOUT === undefined) {
            throw new Error("Cardano network timeout doesn't set correctly");
        }

        this.koiosURL = URL;
        this.interval = INTERVAL;
        this.timeout = CARDANO_TIMEOUT;
        this.initialHeight = INITIAL_HEIGHT;

    }

    static getConfig() {
        if (!Config.instance) {
            Config.instance = new Config();
        }
        return Config.instance;
    }
}