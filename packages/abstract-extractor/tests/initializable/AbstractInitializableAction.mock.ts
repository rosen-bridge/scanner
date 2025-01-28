import { DataSource } from 'typeorm';
import { pick } from 'lodash-es';

import {
  AbstractErgoExtractorEntity,
  BlockInfo,
  AbstractBoxData,
  AbstractInitializableErgoExtractorAction,
} from '../../lib';
import { TestEntity } from '../testUtils';

export class TestInitializableErgoExtractorAction extends AbstractInitializableErgoExtractorAction<
  AbstractBoxData,
  AbstractErgoExtractorEntity
> {
  constructor(dataSource: DataSource) {
    super(dataSource, TestEntity);
  }

  /**
   * create the test database entity from data and block information
   */
  createEntity = (
    boxes: AbstractBoxData[],
    block: BlockInfo,
    extractor: string
  ): Omit<AbstractErgoExtractorEntity, 'id'>[] => {
    return boxes.map((box) => ({
      boxId: box.boxId,
      block: block.hash,
      height: block.height,
      serialized: box.serialized,
      extractor: extractor,
    }));
  };

  /**
   * convert the database entity back to raw data
   */
  convertEntityToData = (
    entities: AbstractErgoExtractorEntity[]
  ): AbstractBoxData[] => {
    return entities.map((data) => pick(data, ['boxId', 'serialized']));
  };
}
