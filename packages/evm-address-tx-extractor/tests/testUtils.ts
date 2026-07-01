import { randomBytes } from 'crypto';

import {
  BlockEntity,
  migrations as blockMigration,
} from '@rosen-bridge/abstract-scanner';
import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';

import {
  AddressTxsEntity,
  EvmTxStatus,
  migrations as addressTxMigration,
} from '../lib';

export const createDatabase = async (): Promise<DataSource> => {
  return new DataSource({
    type: 'sqlite',
    database: ':memory:',
    entities: [AddressTxsEntity, BlockEntity],
    migrations: [...addressTxMigration.sqlite, ...blockMigration.sqlite],
    synchronize: false,
    logging: false,
  })
    .initialize()
    .then(async (dataSource) => {
      await dataSource.runMigrations();
      return dataSource;
    });
};

export const generateRandomId = (): string => randomBytes(32).toString('hex');

/**
 * Creates a mock transaction object for testing purposes.
 * Both unsignedHash and signedHash are generated randomly.
 *
 * @param nonce - The transaction nonce.
 * @param address - The address associated with the transaction.
 * @param blockId - The block ID containing the transaction.
 * @param extractor - The extractor ID that processed the transaction.
 * @param status - The transaction status (defaults to EvmTxStatus.succeed).
 * @returns A mock transaction object.
 */
export const createMockTx = (
  nonce: number,
  address: string,
  blockId: string,
  extractor: string,
  status: EvmTxStatus = EvmTxStatus.succeed,
) => ({
  unsignedHash: '0x' + generateRandomId(),
  signedHash: '0x' + generateRandomId(),
  nonce,
  address,
  blockId,
  extractor,
  status,
});

/**
 * Inserts a mock block into the database for testing.
 *
 * @param dataSource - The DataSource instance.
 * @param height - The block height.
 * @param hash - The block hash.
 * @param parentHash - The parent block hash (auto-generated if not provided).
 * @param scanner - The scanner name (defaults to 'evm').
 */
export const insertMockBlock = async (
  dataSource: DataSource,
  height: number,
  hash: string,
  parentHash: string = '0x' + generateRandomId(),
  scanner: string = 'evm',
) => {
  const repository = dataSource.getRepository(BlockEntity);
  await repository.insert({
    height,
    hash,
    parentHash,
    status: 'PROCEED',
    scanner,
    timestamp: Math.floor(Date.now() / 1000),
  });
};

/**
 * Inserts multiple mock transactions into the database for a given address and extractor.
 * Each transaction gets a random unsignedHash and signedHash.
 *
 * @param repository - The AddressTxsEntity repository.
 * @param address - The address associated with all transactions.
 * @param extractor - The extractor ID that processed the transactions.
 * @param transactions - Array of { nonce, blockId } objects.
 */
export const insertMockTransactions = async (
  repository: Repository<AddressTxsEntity>,
  address: string,
  extractor: string,
  transactions: Array<{ nonce: number; blockId: string }>,
) => {
  for (const tx of transactions) {
    await repository.insert({
      unsignedHash: '0x' + generateRandomId(),
      signedHash: '0x' + generateRandomId(),
      nonce: tx.nonce,
      address,
      blockId: tx.blockId,
      extractor,
      status: EvmTxStatus.succeed,
    });
  }
};
