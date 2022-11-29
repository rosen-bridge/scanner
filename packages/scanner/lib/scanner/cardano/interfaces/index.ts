import { DataSource } from 'typeorm';

interface CardanoKoiosConfig {
  koiosUrl: string;
  timeout: number;
  initialHeight: number;
  dataSource: DataSource;
}

interface CardanoOgmiosConfig {
  nodeIp: string;
  nodePort: number;
  initialSlot: number;
  initialHash: string;
  dataSource: DataSource;
}

export { CardanoKoiosConfig, CardanoOgmiosConfig };
