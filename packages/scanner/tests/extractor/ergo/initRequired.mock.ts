import { V1 } from '@rosen-clients/ergo-explorer';
import {
  AbstractInitRequiredErgoExtractor,
  BlockEntity,
  OutputBox,
  Transaction,
} from '../../../lib';
import { ErgoExtractedData } from '../../../lib/extractor/interfaces';
import { boxesByAddress } from './testData';

export class MockedInitRequiredErgoExtractor extends AbstractInitRequiredErgoExtractor<ErgoExtractedData> {
  getId = () => 'Test';

  forkBlock: (hash: string) => Promise<void>;

  hasData = (box: V1.OutputInfo | OutputBox) => false;

  processTransactions: (
    txs: Transaction[],
    block: BlockEntity
  ) => Promise<boolean>;

  getBoxesWithOffsetLimit = (
    offset: number,
    limit: number
  ): Promise<V1.ItemsOutputInfo> => {
    return Promise.resolve(boxesByAddress);
  };

  extractBoxData = (
    box: V1.OutputInfo | OutputBox,
    blockId: string,
    height: number
  ): Omit<ErgoExtractedData, 'spendBlock' | 'spendHeight'> | undefined => {
    return undefined;
  };
}
