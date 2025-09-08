import { V1 } from '@rosen-clients/ergo-explorer';
import { BlockInfo, OutputBox } from '@rosen-bridge/scanner-interfaces';

import {
  AbstractErgoExtractor,
  AbstractBoxData,
  AbstractErgoExtractorAction,
  AbstractErgoExtractorEntity,
} from '../lib';

export class MockedErgoExtractor extends AbstractErgoExtractor<
  AbstractBoxData,
  AbstractErgoExtractorEntity
> {
  actions: AbstractErgoExtractorAction<
    AbstractBoxData,
    AbstractErgoExtractorEntity
  >;

  getId = () => 'Test';

  initializeBoxes: (initialBlock: BlockInfo) => Promise<void>;

  hasData = (
    box: V1.OutputInfo | OutputBox, // eslint-disable-line @typescript-eslint/no-unused-vars
  ) => false;

  extractBoxData = (
    box: V1.OutputInfo | OutputBox, // eslint-disable-line @typescript-eslint/no-unused-vars
  ): AbstractBoxData | undefined => {
    return undefined;
  };
}
