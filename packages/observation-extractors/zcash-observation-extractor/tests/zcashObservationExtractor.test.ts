import { expect, test } from 'vitest';

import type { DataSource } from '@rosen-bridge/extended-typeorm';
import type { BlockInfo } from '@rosen-bridge/scanner-interfaces';
import type { ZcashRpcTransaction } from '@rosen-bridge/zcash-scanner';

import {
  ZcashObservationBindingError,
  ZcashObservationExtractor,
  type ZcashObservationExtractorOptions,
} from '../lib/zcashObservationExtractor.js';

const block: BlockInfo = {
  height: 106,
  hash: 'cfe65311fe34bf402a685debf1cdd968aec23a88a11d11389ec2d1bbf3ceb240',
};

const transaction: ZcashRpcTransaction = {
  txid: '11'.repeat(32),
  hex: '00',
  size: 1,
  blockhash: block.hash,
  height: block.height,
};

type Preprocessor = {
  preprocessTransactions: (
    transactions: ZcashRpcTransaction[],
    block: BlockInfo,
  ) => ZcashRpcTransaction[];
};

const preprocessor = new ZcashObservationExtractor(
  { getRepository: () => ({}) } as unknown as DataSource,
  {
    network: 'regtest',
    lockAddress: 'tmXebSxnVN4HGSTK4icB4i3FitWjNv5u6pt',
    tokens: {} as ZcashObservationExtractorOptions['tokens'],
    inspector: {
      inspect: () => {
        throw new Error('unused');
      },
    },
    branchIdAtHeight: () => 'c2d6d0b4',
  },
) as unknown as Preprocessor;

test('rejects a transaction envelope that does not bind to the scanner block', () => {
  expect(preprocessor.preprocessTransactions([transaction], block)).toEqual([
    transaction,
  ]);

  expect(() =>
    preprocessor.preprocessTransactions(
      [{ ...transaction, height: block.height + 1 }],
      block,
    ),
  ).toThrow(ZcashObservationBindingError);
  expect(() =>
    preprocessor.preprocessTransactions(
      [{ ...transaction, blockhash: '22'.repeat(32) }],
      block,
    ),
  ).toThrow(ZcashObservationBindingError);
});
