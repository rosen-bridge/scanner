import { DataSource } from 'typeorm';

export interface EVMRpcConfig {
  RPCUrl: string;
  timeout: number;
  initialHeight: number;
  dataSource: DataSource;
}

export class BlockNotFound extends Error {
  constructor(msg: string) {
    super('BlockNotFound: ' + msg);
  }
}
