import { V1 } from '@rosen-clients/ergo-explorer';
import { BlockInfo, OutputBox } from '@rosen-bridge/scanner-interfaces';

import {
  AbstractInitializableErgoExtractor,
  AbstractInitializableErgoExtractorAction,
} from '../../lib/ergo/initializable';
import { AbstractBoxData, AbstractErgoExtractorEntity } from '../../lib';
import { ergoBoxes } from './testData';

export class MockedInitializableErgoExtractor extends AbstractInitializableErgoExtractor<
  AbstractBoxData,
  AbstractErgoExtractorEntity
> {
  actions: AbstractInitializableErgoExtractorAction<
    AbstractBoxData,
    AbstractErgoExtractorEntity
  >;

  getId = () => 'Test';

  hasData = (
    box: V1.OutputInfo | OutputBox, // eslint-disable-line @typescript-eslint/no-unused-vars
  ) => false;

  getTxBlock = async (
    txId: string, // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<BlockInfo> => {
    return { hash: 'hash', height: 100 };
  };

  getBoxesWithOffsetLimit = (
    offset: number, // eslint-disable-line @typescript-eslint/no-unused-vars
    limit: number, // eslint-disable-line @typescript-eslint/no-unused-vars
  ) => {
    return Promise.resolve({ boxes: ergoBoxes, hasNextBatch: true });
  };

  extractBoxData = (
    box: V1.OutputInfo | OutputBox, // eslint-disable-line @typescript-eslint/no-unused-vars
  ) => {
    return undefined;
  };
}
