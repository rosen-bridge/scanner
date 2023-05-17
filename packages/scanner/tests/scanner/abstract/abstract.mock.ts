import { DataSource } from 'typeorm';
import { BlockEntity } from '../../../lib/entities/blockEntity';
import {
  Block,
  AbstractExtractor,
  AbstractNetworkConnector,
} from '../../../lib/interfaces';
import { AbstractScanner } from '../../../lib/scanner/abstract/scanner';
import { migrations } from '../../../lib/migrations';
import { BlockDbAction } from '../../../lib/scanner/action';
import { GeneralScanner } from '../../../lib/scanner/abstract/generalScanner';

interface TestTransaction {
  height: number;
  blockHash: string;
}

export class ExtractorTest extends AbstractExtractor<TestTransaction> {
  id: string;
  forked: Array<string>;
  txs: Array<{ txs: Array<TestTransaction>; block: BlockEntity }>;

  constructor(id: string) {
    super();
    this.id = id;
    this.forked = [];
    this.txs = [];
  }

  processTransactions = (
    txs: Array<TestTransaction>,
    block: BlockEntity
  ): Promise<boolean> => {
    this.txs.push({ txs, block });
    return Promise.resolve(true);
  };

  getId = (): string => {
    return this.id;
  };
  forkBlock = (hash: string) => {
    this.forked.push(hash);
    return Promise.resolve();
  };
  initializeBoxes = () => {
    return Promise.resolve();
  };
}

export class NetworkConnectorTest extends AbstractNetworkConnector<TestTransaction> {
  getBlockAtHeight = (height: number): Promise<Block> => {
    return Promise.resolve({
      parentHash: '0',
      hash: '1',
      blockHeight: height,
    });
  };

  getCurrentHeight = (): Promise<number> => {
    return Promise.resolve(0);
  };

  getBlockTxs = (): Promise<Array<TestTransaction>> => {
    return Promise.resolve([]);
  };
}

export const generateMockScannerClass = (name: string) => {
  return class ScannerTest extends AbstractScanner<TestTransaction> {
    name = (): string => name;

    constructor(dataSource: DataSource) {
      super();
      this.action = new BlockDbAction(dataSource, this.name());
    }
  };
};

export const generateMockGeneralScannerClass = (name: string) => {
  return class ScannerTest extends GeneralScanner<TestTransaction> {
    name = (): string => name;

    constructor(
      dataSource: DataSource,
      networkConnector: NetworkConnectorTest
    ) {
      super();
      this.action = new BlockDbAction(dataSource, this.name());
      this.networkAccess = networkConnector;
    }

    networkAccess: AbstractNetworkConnector<TestTransaction>;

    getFirstBlock = async (): Promise<Block> => {
      return { blockHeight: 2, hash: '2', parentHash: '1' };
    };
  };
};

export const createDatabase = async () => {
  const dataSource = new DataSource({
    type: 'sqlite',
    database: `:memory:`,
    entities: [BlockEntity],
    synchronize: false,
    migrations: migrations.sqlite,
    logging: false,
  });
  await dataSource.initialize();
  await dataSource.runMigrations();
  return dataSource;
};

export const insertBlocks = async (
  scanner: AbstractScanner<TestTransaction>,
  count: number
) => {
  for (let index = 1; index <= count; index++) {
    const parent = index > 1 ? `${index - 1}` : ' ';
    await scanner.action.saveBlock({
      parentHash: parent,
      hash: `${index}`,
      blockHeight: index,
    });
    await scanner.action.updateBlockStatus(index);
  }
};
