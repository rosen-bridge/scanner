import { DataSource } from "typeorm";
export interface CardanoScannerConfig {
    koiosUrl: string;
    timeout: number;
    initialHeight: number;
    dataSource: DataSource;
}
