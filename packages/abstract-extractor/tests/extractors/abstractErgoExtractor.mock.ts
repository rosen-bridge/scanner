import { BlockInfo, Transaction } from '@rosen-bridge/scanner-interfaces';

import {
  AbstractErgoExtractor,
  AbstractEntityData,
  AbstractErgoBoxEntity,
  AbstractErgoAction,
} from '../../lib';

export class MockedErgoExtractor extends AbstractErgoExtractor<
  AbstractEntityData,
  AbstractErgoBoxEntity
> {
  actions: AbstractErgoAction<AbstractEntityData, AbstractErgoBoxEntity>;

  processTransactions: (
    transactions: Transaction[],
    block: BlockInfo,
  ) => Promise<boolean>;

  getId = () => 'TestErgoExtractor';
}
