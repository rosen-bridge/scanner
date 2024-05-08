import { AbstractErgoExtractorAction } from '../abstractAction';

export abstract class AbstractInitializableErgoExtractorAction<
  ExtractedData
> extends AbstractErgoExtractorAction<ExtractedData> {
  /**
   * Remove all existing data
   */
  abstract removeAllData: (extractorId: string) => Promise<void>;
}
