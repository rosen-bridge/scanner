import { DataSource } from 'typeorm';

interface EVMRPCConfig {
  RPCUrl: string;
  timeout: number;
  initialHeight: number;
  dataSource: DataSource;
}

export { EVMRPCConfig };
