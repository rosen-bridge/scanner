import {
  ObservationEntity,
  migrations,
} from '@rosen-bridge/abstract-observation-extractor';
import {
  migrations as scannerMigrations,
  BlockEntity,
} from '@rosen-bridge/abstract-scanner';
import { DataSource } from '@rosen-bridge/extended-typeorm';

const fromAddress =
  'addr_test1vzg07d2qp3xje0w77f982zkhqey50gjxrsdqh89yx8r7nasu97hr0';

export const cardanoTxValid = {
  block_hash: '',
  metadata: {
    '0': JSON.parse(
      '{' +
        '"to": "ergo",' +
        '"bridgeFee": "10000",' +
        '"networkFee": "10000",' +
        '"toAddress": "ergoAddress",' +
        ' "fromAddress": ["' +
        fromAddress +
        '"] }',
    ),
  },
  tx_hash: '9f00d372e930d685c3b410a10f2bd035cd9a927c4fd8ef8e419c79b210af7ba6',
  inputs: [
    {
      payment_addr: {
        bech32:
          'addr_test1vzg07d2qp3xje0w77f982zkhqey50gjxrsdqh89yx8r7nasu97hr0',
        cred: '90ff35400c4d2cbddef24a750ad7064947a2461c1a0b9ca431c7e9f6',
      },
      stake_addr: null,
      tx_hash:
        '9f00d372e930d685c3b410a10f2bd035cd9a927c4fd8ef8e419c79b210af7ba6',
      tx_index: 1,
      value: '979445417',
      asset_list: [
        {
          policy_id: 'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2',
          asset_name: '646f6765',
          quantity: '10000000',
        },
        {
          policy_id: 'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2',
          asset_name: '7369676d61',
          quantity: '9999978',
        },
      ],
    },
  ],
  outputs: [
    {
      payment_addr: {
        bech32:
          'addr_test1vze7yqqlg8cjlyhz7jzvsg0f3fhxpuu6m3llxrajfzqecggw704re',
        cred: 'b3e2001f41f12f92e2f484c821e98a6e60f39adc7ff30fb248819c21',
      },
      tx_hash:
        'cf32ad374daefdce563e3391effc4fc42eb0e74bbec8afe16a46eeea69e3b2aa',
      stake_addr: null,
      tx_index: 0,
      value: '10000000',
      asset_list: [
        {
          policy_id: 'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2',
          asset_name: '7369676d61',
          quantity: '10',
        },
      ],
    },
    {
      payment_addr: {
        bech32:
          'addr_test1vzg07d2qp3xje0w77f982zkhqey50gjxrsdqh89yx8r7nasu97hr0',
        cred: '90ff35400c4d2cbddef24a750ad7064947a2461c1a0b9ca431c7e9f6',
      },
      tx_hash:
        'cf32ad374daefdce563e3391effc4fc42eb0e74bbec8afe16a46eeea69e3b2aa',
      stake_addr: null,
      tx_index: 1,
      value: '969261084',
      asset_list: [
        {
          policy_id: 'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2',
          asset_name: '646f6765',
          quantity: '10000000',
        },
        {
          policy_id: 'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2',
          asset_name: '7369676d61',
          quantity: '9999968',
        },
      ],
    },
  ],
};

export const createDatabase = async (): Promise<DataSource> => {
  return new DataSource({
    type: 'sqlite',
    database: `:memory:`,
    entities: [BlockEntity, ObservationEntity],
    migrations: [...migrations.sqlite, ...scannerMigrations.sqlite],
    synchronize: false,
    logging: false,
  })
    .initialize()
    .then(async (dataSource) => {
      await dataSource.runMigrations();
      return dataSource;
    });
};

export const generateBlockEntity = (
  dataSource: DataSource,
  hash: string,
  parent?: string,
  height?: number,
) => {
  const repository = dataSource.getRepository(BlockEntity);
  return repository.create({
    height: height ? height : 1,
    parentHash: parent ? parent : '1',
    hash: hash,
  });
};
