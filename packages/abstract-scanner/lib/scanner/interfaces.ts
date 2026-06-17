import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { AbstractNetworkConnector } from '@rosen-bridge/scanner-interfaces';

export interface ScannerConfig<TransactionType> {
  dataSource: DataSource;
  initialHeight: number;
  network: AbstractNetworkConnector<TransactionType>;
  blockRetrieveGap?: number;
  suffix?: string;
  heightGap?: number;
  logger?: AbstractLogger;
}
