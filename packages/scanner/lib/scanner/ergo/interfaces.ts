import { DataSource } from 'typeorm';

export enum ErgoNetworkType {
  Explorer = 'explorer',
  Node = 'node',
}

export interface ErgoScannerConfig {
  type: ErgoNetworkType;
  url: string;
  timeout: number;
  dataSource: DataSource;
  initialHeight: number;
}
