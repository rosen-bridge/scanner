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

export { CardanoKoiosConfig, CardanoOgmiosConfig };
