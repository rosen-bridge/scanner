import { TransactionResponse } from 'ethers';
import { DataSource } from 'typeorm';

interface EVMRPCConfig {
  RPCUrl: string;
  timeout: number;
  initialHeight: number;
  dataSource: DataSource;
}

class BlockNotFound extends Error {
  constructor(msg: string) {
    super('BlockNotFound: ' + msg);
  }
}

export { EVMRPCConfig, BlockNotFound };

export type RPCTransaction = TransactionResponse;
