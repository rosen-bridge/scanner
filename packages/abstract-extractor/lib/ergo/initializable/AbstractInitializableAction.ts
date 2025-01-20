import { DataSource, EntityTarget, ObjectLiteral } from 'typeorm';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';

import { AbstractErgoExtractorAction } from '../AbstractErgoExtractorAction';
import { ErgoExtractedData } from '../interfaces';
import { AbstractErgoExtractorEntity } from '../AbstractErgoExtractorEntity';

export abstract class AbstractInitializableErgoExtractorAction<
  ExtractedData extends ErgoExtractedData,
  ExtractorEntity extends AbstractErgoExtractorEntity
> extends AbstractErgoExtractorAction<ExtractedData, ExtractorEntity> {
  constructor(
    dataSource: DataSource,
    repo: EntityTarget<ExtractorEntity>,
    logger?: AbstractLogger
  ) {
    super(dataSource, repo, logger);
  }

  /**
   * remove all existing data for the extractor
   * @param extractorId
   */
  removeAllData = async (extractorId: string) => {
    await this.repository.delete({ extractor: extractorId } as any);
  };
}
