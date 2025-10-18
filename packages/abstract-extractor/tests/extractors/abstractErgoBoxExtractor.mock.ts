import { OutputBox } from '@rosen-bridge/scanner-interfaces';
import { V1 } from '@rosen-clients/ergo-explorer';

import {
  AbstractEntityData,
  AbstractErgoBoxEntity,
  AbstractErgoBoxAction,
  AbstractErgoBoxExtractor,
} from '../../lib';

export class MockedErgoBoxExtractor extends AbstractErgoBoxExtractor<
  AbstractEntityData,
  AbstractErgoBoxEntity
> {
  declare actions: AbstractErgoBoxAction<
    AbstractEntityData,
    AbstractErgoBoxEntity
  >;

  getId = () => 'TestErgoBoxExtractor';

  hasBoxData = (
    box: V1.OutputInfo | OutputBox, // eslint-disable-line @typescript-eslint/no-unused-vars
  ) => false;

  extractBoxData = (
    box: V1.OutputInfo | OutputBox, // eslint-disable-line @typescript-eslint/no-unused-vars
  ): AbstractEntityData | undefined => {
    return undefined;
  };
}
