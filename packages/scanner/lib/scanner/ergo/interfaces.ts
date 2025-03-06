import { ErgoNetworkType } from '@rosen-bridge/scanner-interfaces';
import { DataSource } from 'typeorm';

export interface ErgoScannerConfig {
  type: ErgoNetworkType;
  url: string;
  timeout: number;
  dataSource: DataSource;
  initialHeight: number;
}
