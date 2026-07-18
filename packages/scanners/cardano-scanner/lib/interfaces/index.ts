import { BlockCleanupConfig } from '@rosen-bridge/abstract-scanner/dist/scanner/interfaces';
import { DataSource } from '@rosen-bridge/extended-typeorm';

interface OgmiosReconnectionConfig {
  initialDelay?: number;
  maxDelay?: number;
  maxAttempts?: number;
}

interface CardanoOgmiosConfig {
  nodeHostOrIp: string;
  nodePort: number;
  initialSlot: number;
  initialHash: string;
  maxTryBlock?: number;
  dataSource: DataSource;
  blockCleanupConfig: BlockCleanupConfig;
  useTls?: boolean;
  reconnectionConfig?: OgmiosReconnectionConfig;
  suffix?: string;
}

export { OgmiosReconnectionConfig, CardanoOgmiosConfig };
