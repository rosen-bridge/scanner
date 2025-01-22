import { DataSource } from 'typeorm';
import {
  AbstractErgoExtractorAction,
  AbstractErgoExtractorEntity,
  BlockInfo,
  AbstractBoxData,
} from '../lib';
import { pick } from 'lodash-es';
import { TestEntity } from './testUtils';

export class TestErgoExtractorAction extends AbstractErgoExtractorAction<
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
