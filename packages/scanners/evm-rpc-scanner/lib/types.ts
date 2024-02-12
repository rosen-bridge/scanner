import { DataSource } from 'typeorm';

export interface EvmRpcConfig {
  RpcUrl: string;
  timeout: number;
  initialHeight: number;
  dataSource: DataSource;
}

export class BlockNotFound extends Error {
  constructor(msg: string) {
    super('BlockNotFound: ' + msg);
  }
}
