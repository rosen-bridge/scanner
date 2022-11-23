import { DataSource } from 'typeorm';

export interface CardanoKoiosConfig {
  koiosUrl: string;
  timeout: number;
  initialHeight: number;
  dataSource: DataSource;
}

export interface CardanoOgmiosConfig {
  nodeIp: string;
  nodePort: number;
  initialSlot: number;
  initialHash: string;
  dataSource: DataSource;
}
