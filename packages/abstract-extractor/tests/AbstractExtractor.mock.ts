import { V1 } from '@rosen-clients/ergo-explorer';
import {
  AbstractErgoExtractor,
  BlockInfo,
  OutputBox,
  ErgoExtractedData,
  AbstractErgoExtractorAction,
} from '../lib';

export class MockedErgoExtractor extends AbstractErgoExtractor<ErgoExtractedData> {
  actions: AbstractErgoExtractorAction<ErgoExtractedData>;

  getId = () => 'Test';

  initializeBoxes: (initialBlock: BlockInfo) => Promise<void>;

  hasData = (box: V1.OutputInfo | OutputBox) => false;

  extractBoxData = (
    box: V1.OutputInfo | OutputBox
  ): ErgoExtractedData | undefined => {
    return undefined;
  };
}
