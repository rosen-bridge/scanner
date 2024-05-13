import { Block } from '../interfaces';
import { SpendInfo } from './interfaces';

export abstract class AbstractErgoExtractorAction<ExtractedData> {
  /**
   * insert all extracted box data in an atomic transaction
   * @param data
   * @param extractorId
   * @return process success
   */
  abstract insertBoxes: (
    data: ExtractedData[],
    extractorId: string
  ) => Promise<boolean>;

  /**
   * update spending information of stored boxes
   * @param spendInfos
   * @param block
   * @param extractorId
   */
  abstract spendBoxes: (
    spendInfos: SpendInfo[],
    block: Block,
    extractorId: string
  ) => Promise<void>;

  /**
   * delete extracted data from a specific block
   * if a box is spend in this block mark it as unspent
   * if a box is created in this block remove it from database
   * @param block
   * @param extractorId
   */
  abstract deleteBlockBoxes: (
    block: string,
    extractorId: string
  ) => Promise<void>;
}
