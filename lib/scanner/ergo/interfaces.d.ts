import { DataSource } from "typeorm";
export interface ErgoScannerConfig {
    nodeUrl: string;
    timeout: number;
    dataSource: DataSource;
    initialHeight: number;
}
