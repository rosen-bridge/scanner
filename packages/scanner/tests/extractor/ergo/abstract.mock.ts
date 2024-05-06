import { V1 } from '@rosen-clients/ergo-explorer';
import { AbstractErgoExtractor, InitialInfo, OutputBox } from '../../../lib';
import { ErgoExtractedData } from '../../../lib/extractor/interfaces';

export class MockedErgoExtractor extends AbstractErgoExtractor<ErgoExtractedData> {
  getId = () => 'Test';

  forkBlock: (hash: string) => Promise<void>;

  initializeBoxes: (initialBlock: InitialInfo) => Promise<void>;

  hasData = (box: V1.OutputInfo | OutputBox) => false;

  extractBoxData = (
    box: V1.OutputInfo | OutputBox,
    blockId: string,
    height: number
  ): Omit<ErgoExtractedData, 'spendBlock' | 'spendHeight'> | undefined => {
    return undefined;
  };
}
