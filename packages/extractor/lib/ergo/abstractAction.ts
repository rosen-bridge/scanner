import { Block, SpendInfo } from '../interfaces';

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
    block: Block,
    extractorId: string
  ) => Promise<void>;
}

export abstract class AbstractInitializableErgoExtractorAction<
  ExtractedData
> extends AbstractErgoExtractorAction<ExtractedData> {
  /**
   * Remove all existing data
   */
  abstract removeAllData: (extractorId: string) => Promise<void>;
}
