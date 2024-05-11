import { AbstractErgoExtractorAction } from '../AbstractErgoExtractorAction';

export abstract class AbstractInitializableErgoExtractorAction<
  ExtractedData
> extends AbstractErgoExtractorAction<ExtractedData> {
  /**
   * remove all existing data for the extractor
   * @param extractorId
   */
  abstract removeAllData: (extractorId: string) => Promise<void>;
}
