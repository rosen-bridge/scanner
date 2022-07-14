export interface ScannerConfig{
    interval: number;
    initialBlockHeight: number;
    timeout: number;
    node: {
        URL: string;
    }
}