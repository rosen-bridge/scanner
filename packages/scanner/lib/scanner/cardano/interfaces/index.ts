import { DataSource } from 'typeorm';

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
  useTls?: boolean;
  reconnectionConfig?: OgmiosReconnectionConfig;
}

export { OgmiosReconnectionConfig, CardanoOgmiosConfig };
