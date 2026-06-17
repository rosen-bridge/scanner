import { BlockTimeConfig } from '@rosen-bridge/abstract-scanner/dist/scanner/interfaces';
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
  blockTimeConfig: BlockTimeConfig;
  useTls?: boolean;
  reconnectionConfig?: OgmiosReconnectionConfig;
  suffix?: string;
}

export { OgmiosReconnectionConfig, CardanoOgmiosConfig };
