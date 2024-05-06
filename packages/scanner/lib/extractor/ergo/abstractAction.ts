import { BlockEntity } from '../../index';
import { SpendInfo } from '../interfaces';

export abstract class AbstractErgoExtractorAction<ExtractedData> {
  /**
   * Insert all extracted box data in an atomic transaction
   */
  abstract insertBoxes: (
    data: ExtractedData[],
    extractorId: string
  ) => Promise<void>;

  /**
   * Update spending information of stored boxes
   */
  abstract spendBoxes: (
    spendInfos: SpendInfo[],
    block: BlockEntity,
    extractorId: string
  ) => Promise<void>;
}

export abstract class AbstractInitRequiredExtractorAction<ExtractedData> {
  /**
   * Insert all extracted box data in an atomic transaction
   */
  abstract insertBoxes: (
    data: ExtractedData[],
    extractorId: string
  ) => Promise<void>;

  /**
   * Remove all existing data
   */
  abstract removeAllData: (extractorId: string) => Promise<void>;
}
