import { BlockInfo, Transaction } from '@rosen-bridge/scanner-interfaces';

import {
  AbstractErgoExtractor,
  AbstractEntityData,
  AbstractErgoEntity,
  AbstractErgoAction,
} from '../../lib';

export class MockedErgoExtractor extends AbstractErgoExtractor<
  AbstractEntityData,
  AbstractErgoEntity
> {
  actions: AbstractErgoAction<AbstractEntityData, AbstractErgoEntity>;

  processTransactions = (
    txs: Transaction[], // eslint-disable-line @typescript-eslint/no-unused-vars
    block: BlockInfo, // eslint-disable-line @typescript-eslint/no-unused-vars
  ) => Promise.resolve(true);

  initializeData: (initialBlock: BlockInfo) => Promise<void>;

  getId = () => 'TestErgoExtractor';
}
