import { DataSource } from 'typeorm';
import { FraudEntity } from '../../lib';
import { migrations } from '../../lib';
import {
  migrations as scannerMigrations,
  Transaction,
} from '@rosen-bridge/scanner';
import * as wasm from 'ergo-lib-wasm-nodejs';
import JsonBI from '@rosen-bridge/json-bigint';
import { last10BlockHeader } from './fraudExtractorTestData';

/**
 * Create and initialize database with required entities
 * @returns initialized datasource
 */
const createDatabase = async (): Promise<DataSource> => {
  const dataSource = new DataSource({
    type: 'sqlite',
    database: `:memory:`,
    entities: [FraudEntity],
    migrations: [...migrations.sqlite, ...scannerMigrations.sqlite],
    synchronize: false,
    logging: false,
  });
  await dataSource.initialize();
  await dataSource.runMigrations();
  return dataSource;
};

/**
 * Generate a fraud tx with required parameters
 * @param rwtId
 * @param wid
 * @param fraudAddress
 * @param hasToken
 * @returns
 */
const generateFraudTx = (
  rwtId: string,
  wid: string,
  fraudAddress: string,
  hasToken = true
) => {
  const sk = wasm.SecretKey.random_dlog();
  const commitmentAddressContract = wasm.Contract.pay_to_address(
    wasm.Address.from_base58(fraudAddress)
  );
  const address = wasm.Contract.pay_to_address(sk.get_address());
  const outBoxValue = wasm.BoxValue.from_i64(wasm.I64.from_str('100000000'));
  const outBoxBuilder = new wasm.ErgoBoxCandidateBuilder(
    outBoxValue,
    commitmentAddressContract,
    0
  );

  if (hasToken) {
    outBoxBuilder.add_token(
      wasm.TokenId.from_str(rwtId),
      wasm.TokenAmount.from_i64(wasm.I64.from_str('10'))
    );
  }

  outBoxBuilder.set_register_value(
    4,
    wasm.Constant.from_coll_coll_byte([new Uint8Array(Buffer.from(wid, 'hex'))])
  );

  const outBox = outBoxBuilder.build();
  const tokens = new wasm.Tokens();
  if (hasToken) {
    tokens.add(
      new wasm.Token(
        wasm.TokenId.from_str(rwtId),
        wasm.TokenAmount.from_i64(wasm.I64.from_str('10'))
      )
    );
  }

  const inputBox = new wasm.ErgoBox(
    wasm.BoxValue.from_i64(wasm.I64.from_str('1100000000')),
    0,
    address,
    wasm.TxId.zero(),
    0,
    tokens
  );
  const unspentBoxes = new wasm.ErgoBoxes(inputBox);
  const txOutputs = new wasm.ErgoBoxCandidates(outBox);
  const fee = wasm.TxBuilder.SUGGESTED_TX_FEE();
  const boxSelector = new wasm.SimpleBoxSelector();
  const targetBalance = wasm.BoxValue.from_i64(
    outBoxValue.as_i64().checked_add(fee.as_i64())
  );
  const boxSelection = boxSelector.select(unspentBoxes, targetBalance, tokens);
  const tx = wasm.TxBuilder.new(
    boxSelection,
    txOutputs,
    0,
    fee,
    sk.get_address()
  ).build();
  const blockHeaders = wasm.BlockHeaders.from_json(last10BlockHeader);
  const preHeader = wasm.PreHeader.from_block_header(blockHeaders.get(0));
  const ctx = new wasm.ErgoStateContext(preHeader, blockHeaders);
  const sks = new wasm.SecretKeys();
  sks.add(sk);
  const wallet = wasm.Wallet.from_secrets(sks);
  const signed = wallet.sign_transaction(
    ctx,
    tx,
    unspentBoxes,
    wasm.ErgoBoxes.from_boxes_json([])
  );
  return JsonBI.parse(signed.to_json()) as Transaction;
};

/**
 * Insert a fraud entity in the database
 * @param dataSource
 * @param boxId
 * @param height
 * @returns
 */
const insertFraudEntity = (
  dataSource: DataSource,
  boxId?: string,
  height?: number
) => {
  const repository = dataSource.getRepository(FraudEntity);
  return repository.insert({
    creationHeight: height || 1,
    creationBlock: 'blockId',
    creationTxId: 'txId',
    boxId: boxId || 'boxId',
    wid: 'wid',
    rwtCount: '100',
    triggerBoxId: 'triggerId',
    serialized: 'serialized',
    extractor: 'extractor',
  });
};

export { createDatabase, generateFraudTx, insertFraudEntity };
