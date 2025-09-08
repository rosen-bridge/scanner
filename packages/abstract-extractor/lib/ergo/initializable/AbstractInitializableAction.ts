import {
  DataSource,
  EntityTarget,
  FindOptionsWhere,
} from '@rosen-bridge/extended-typeorm';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';

import { AbstractErgoExtractorAction } from '../AbstractErgoExtractorAction';
import { AbstractBoxData } from '../interfaces';
import { AbstractErgoExtractorEntity } from '../AbstractErgoExtractorEntity';

export abstract class AbstractInitializableErgoExtractorAction<
  ExtractedData extends AbstractBoxData,
  ExtractorEntity extends AbstractErgoExtractorEntity,
> extends AbstractErgoExtractorAction<ExtractedData, ExtractorEntity> {
  constructor(
    dataSource: DataSource,
    repo: EntityTarget<ExtractorEntity>,
    logger?: AbstractLogger,
  ) {
    super(dataSource, repo, logger);
  }

  /**
   * remove all existing data for the extractor
   * @param extractorId
   */
  removeAllData = async (extractorId: string) => {
    await this.repository.delete({
      extractor: extractorId,
    } as FindOptionsWhere<ExtractorEntity>);
  };
}
