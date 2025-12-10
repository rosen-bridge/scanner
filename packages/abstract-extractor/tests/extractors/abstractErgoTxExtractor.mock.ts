import { Transaction } from '@rosen-bridge/scanner-interfaces';

import {
  AbstractErgoTxExtractor,
  AbstractEntityData,
  AbstractErgoEntity,
  AbstractErgoAction,
} from '../../lib';

export class MockedErgoTxExtractor extends AbstractErgoTxExtractor<
  AbstractEntityData,
  AbstractErgoEntity
> {
  actions: AbstractErgoAction<AbstractEntityData, AbstractErgoEntity>;

  hasTxData = (
    tx: Transaction, // eslint-disable-line @typescript-eslint/no-unused-vars
  ) => false;
  extractTxData = () => undefined;
  getId = () => 'TestErgoExtractor';
}
