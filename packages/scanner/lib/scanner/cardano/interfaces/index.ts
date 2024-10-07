import { DataSource } from 'typeorm';

interface CardanoKoiosConfig {
  koiosUrl: string;
  timeout: number;
  initialHeight: number;
  dataSource: DataSource;
}

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

interface CardanoBlockFrostConfig {
  projectId: string;
  timeout: number;
  initialHeight: number;
  dataSource: DataSource;
  blockFrostUrl?: string;
}

interface CardanoGraphQLConfig {
  graphQLUri: string;
  initialHeight: number;
  dataSource: DataSource;
}

export {
  CardanoKoiosConfig,
  OgmiosReconnectionConfig,
  CardanoOgmiosConfig,
  CardanoBlockFrostConfig,
  CardanoGraphQLConfig,
};
