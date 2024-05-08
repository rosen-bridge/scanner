import { V1 } from '@rosen-clients/ergo-explorer';
import {
  AbstractInitializableErgoExtractor,
  OutputBox,
  ErgoExtractedData,
  BlockInfo,
  ErgoBox,
  AbstractInitializableErgoExtractorAction,
} from '../../lib';
import { ergoBoxes } from './testData';

export class MockedInitializableErgoExtractor extends AbstractInitializableErgoExtractor<ErgoExtractedData> {
  actions: AbstractInitializableErgoExtractorAction<ErgoExtractedData>;

  getId = () => 'Test';

  hasData = (box: V1.OutputInfo | OutputBox) => false;

  getTxBlock = async (txId: string): Promise<BlockInfo> => {
    return { hash: 'hash', height: 100 };
  };

  getBoxesWithOffsetLimit = (
    offset: number,
    limit: number
  ): Promise<ErgoBox[]> => {
    return Promise.resolve(ergoBoxes);
  };

  extractBoxData = (
    box: V1.OutputInfo | OutputBox,
    blockId: string,
    height: number
  ): Omit<ErgoExtractedData, 'spendBlock' | 'spendHeight'> | undefined => {
    return undefined;
  };
}
