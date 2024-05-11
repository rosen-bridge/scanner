import { V1 } from '@rosen-clients/ergo-explorer';
import {
  AbstractInitializableErgoExtractor,
  AbstractInitializableErgoExtractorAction,
} from '../../lib/ergo/initializable';
import { OutputBox, ErgoExtractedData, BlockInfo } from '../../lib';
import { ergoBoxes } from './testData';

export class MockedInitializableErgoExtractor extends AbstractInitializableErgoExtractor<ErgoExtractedData> {
  actions: AbstractInitializableErgoExtractorAction<ErgoExtractedData>;

  getId = () => 'Test';

  hasData = (box: V1.OutputInfo | OutputBox) => false;

  getTxBlock = async (txId: string): Promise<BlockInfo> => {
    return { hash: 'hash', height: 100 };
  };

  getBoxesWithOffsetLimit = (offset: number, limit: number) => {
    return Promise.resolve({ boxes: ergoBoxes, hasNextBatch: true });
  };

  extractBoxData = (
    box: V1.OutputInfo | OutputBox,
    blockId: string,
    height: number
  ) => {
    return undefined;
  };
}
