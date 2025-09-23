import { Transaction } from '@rosen-bridge/scanner-interfaces';

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

  hasTxData = (
    tx: Transaction, // eslint-disable-line @typescript-eslint/no-unused-vars
  ) => false;
  extractTxData = (
    tx: Transaction, // eslint-disable-line @typescript-eslint/no-unused-vars
  ) => undefined;
  getId = () => 'TestErgoExtractor';
}
