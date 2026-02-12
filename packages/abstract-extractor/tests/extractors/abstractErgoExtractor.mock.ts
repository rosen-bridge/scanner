import { BlockInfo } from '@rosen-bridge/scanner-interfaces';

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

  processTransactions = () => Promise.resolve(true);

  initializeData: (initialBlock: BlockInfo) => Promise<void>;

  getId = () => 'TestErgoExtractor';
}
