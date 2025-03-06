import { V1 } from '@rosen-clients/ergo-explorer';
import { BlockInfo } from '@rosen-bridge/scanner-interfaces';

import {
  AbstractErgoExtractor,
  OutputBox,
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

  hasData = (box: V1.OutputInfo | OutputBox) => false;

  extractBoxData = (
    box: V1.OutputInfo | OutputBox
  ): AbstractBoxData | undefined => {
    return undefined;
  };
}
