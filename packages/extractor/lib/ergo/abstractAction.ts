import { Block, SpendInfo } from '../interfaces';

export abstract class AbstractErgoExtractorAction<ExtractedData> {
  /**
   * insert all extracted box data in an atomic transaction
   */
  abstract insertBoxes: (
    data: ExtractedData[],
    extractorId: string
  ) => Promise<void>;

  /**
   * update spending information of stored boxes
   */
  abstract spendBoxes: (
    spendInfos: SpendInfo[],
    block: Block,
    extractorId: string
  ) => Promise<void>;

  /**
   * delete boxes in specific block from database. if box spend in this block marked as unspent
   * and if created in this block remove it from database
   * @param block
   * @param extractor
   */
  abstract deleteBlockBoxes: (
    block: string,
    extractorId: string
  ) => Promise<void>;
}
