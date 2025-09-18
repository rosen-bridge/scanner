import { DataSource } from '@rosen-bridge/extended-typeorm';
import {
  BlockInfo,
  Block,
  AbstractNetworkConnector,
} from '@rosen-bridge/scanner-interfaces';
import { AbstractExtractor } from '@rosen-bridge/abstract-extractor';

import { BlockEntity } from '../../../lib/entities/blockEntity';
import { AbstractScanner } from '../../../lib/scanner/abstract/scanner';
import { migrations } from '../../../lib/migrations';
import { BlockDbAction } from '../../../lib/scanner/action';
import { GeneralScanner } from '../../../lib/scanner/abstract/generalScanner';
import { WebSocketScanner } from '../../../lib';
import { ExtractorStatusEntity } from '../../../lib/entities/extractorStatusEntity';

export interface TestTransaction {
  height: number;
  blockHash: string;
}

export class ExtractorTest extends AbstractExtractor<TestTransaction> {
  id: string;
  forked: Array<string>;
  txs: Array<{ txs: Array<TestTransaction>; block: BlockInfo }>;

  constructor(id: string) {
    super();
    this.id = id;
    this.forked = [];
    this.txs = [];
  }

  processTransactions = (
    txs: Array<TestTransaction>,
    block: BlockInfo,
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
  initializeData = () => {
    return Promise.resolve();
  };
}

export class NetworkConnectorTest extends AbstractNetworkConnector<TestTransaction> {
  getBlockAtHeight = (height: number): Promise<Block> => {
    return Promise.resolve({
      parentHash: '0',
      hash: '1',
      height: height,
      timestamp: 10,
    });
  };

  getCurrentHeight = (): Promise<number> => {
    return Promise.resolve(0);
  };

  getBlockTxs = (): Promise<Array<TestTransaction>> => {
    return Promise.resolve([]);
  };
}

export class TestAbstractScanner extends AbstractScanner<TestTransaction> {
  constructor(
    private scannerName: string,
    dataSource: DataSource,
  ) {
    super();
    this.action = new BlockDbAction(dataSource, scannerName);
  }

  name = (): string => this.scannerName;
}

export class TestGeneralScanner extends GeneralScanner<TestTransaction> {
  constructor(
    name: string,
    dataSource: DataSource,
    networkConnector: NetworkConnectorTest,
  ) {
    super(name, dataSource, 0, networkConnector, 100, undefined);
  }

  getFirstBlock = async (): Promise<Block> => {
    return { height: 2, hash: '2', parentHash: '1', timestamp: 20 };
  };
}

export const createDatabase = async () => {
  const dataSource = new DataSource({
    type: 'sqlite',
    database: `:memory:`,
    entities: [BlockEntity, ExtractorStatusEntity],
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
  count: number,
) => {
  for (let index = 1; index <= count; index++) {
    const parent = index > 1 ? `${index - 1}` : ' ';
    await scanner.action.saveBlock({
      parentHash: parent,
      hash: `${index}`,
      height: index,
      timestamp: 10 * index,
    });
    await scanner.action.updateBlockStatus(index, 'hash', []);
  }
};

export class TestWebSocketScanner extends WebSocketScanner<{ id: string }> {
  constructor(dataSource: DataSource) {
    super('test scanner');
    this.action = new BlockDbAction(dataSource, this.name());
  }

  mockedTryFnCall = (fn: () => Promise<boolean>, msg: string) =>
    this.tryRunningFunction(fn, msg);

  start = async () => Promise.resolve();

  stop = async () => Promise.resolve();
}

export class FailExtractor extends AbstractExtractor<{ id: string }> {
  forkBlock = async (
    hash: string, // eslint-disable-line @typescript-eslint/no-unused-vars
  ) => {
    /* empty */
  };

  getId = () => 'fail extractor';

  initializeData = () => Promise.resolve();

  processTransactions = async (
    txs: Array<{ id: string }>, // eslint-disable-line @typescript-eslint/no-unused-vars
    block: BlockInfo, // eslint-disable-line @typescript-eslint/no-unused-vars
  ) => false;
}
