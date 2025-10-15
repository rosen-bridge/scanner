import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import {
  DataSource,
  EntityTarget,
  FindOptionsWhere,
} from '@rosen-bridge/extended-typeorm';

import { AbstractErgoExtractorAction } from '../abstractErgoExtractorAction';
import { AbstractErgoExtractorEntity } from '../abstractErgoExtractorEntity';
import { AbstractBoxData } from '../interfaces';

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
