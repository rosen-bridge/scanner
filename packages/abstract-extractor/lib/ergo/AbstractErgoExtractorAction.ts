import { BlockInfo } from '../interfaces';
import { ErgoExtractedData, SpendInfo } from './interfaces';

export abstract class AbstractErgoExtractorAction<ExtractedData> {
  /**
   * insert all extracted box data in an atomic transaction
   * @param data
   * @param block
   * @param extractorId
   * @returns inserted data and updated data
   * returns undefined if the process is unsuccessful
   */
  abstract insertBoxes: (
    data: ExtractedData[],
    block: BlockInfo,
    extractorId: string
  ) => Promise<boolean>;

  /**
   * update spending information of stored boxes
   * @param spendInfos
   * @param block
   * @param extractorId
   * @returns spent boxes boxIds
   */
  abstract spendBoxes: (
    spendInfos: SpendInfo[],
    block: BlockInfo,
    extractorId: string
  ) => Promise<ErgoExtractedData[]>;

  /**
   * delete extracted data from a specific block
   * if a box is spend in this block mark it as unspent
   * if a box is created in this block remove it from database
   * @param block
   * @param extractorId
   * @returns deleted data and updated data
   */
  abstract deleteBlockBoxes: (
    block: string,
    extractorId: string
  ) => Promise<{
    deletedData: ExtractedData[];
    updatedData: ErgoExtractedData[];
  }>;
}
