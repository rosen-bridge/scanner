import { DataSource } from 'typeorm';

interface CardanoKoiosConfig {
  koiosUrl: string;
  timeout: number;
  initialHeight: number;
  dataSource: DataSource;
}

interface CardanoOgmiosConfig {
  nodeHostOrIp: string;
  nodePort: number;
  initialSlot: number;
  initialHash: string;
  maxTryBlock?: number;
  dataSource: DataSource;
  useTls?: boolean;
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
  timeout: number;
  initialHeight: number;
  dataSource: DataSource;
}

export {
  CardanoKoiosConfig,
  CardanoOgmiosConfig,
  CardanoBlockFrostConfig,
  CardanoGraphQLConfig,
};
