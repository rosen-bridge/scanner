import { DataSource } from '@rosen-bridge/extended-typeorm';
import { pick } from 'lodash-es';
import { BlockInfo } from '@rosen-bridge/scanner-interfaces';

import {
  AbstractErgoAction,
  AbstractErgoEntity,
  AbstractEntityData,
} from '../../lib';
import { TestEntity } from '../testUtils';

export class TestErgoAction extends AbstractErgoAction<
  AbstractEntityData,
  AbstractErgoEntity
> {
  constructor(dataSource: DataSource) {
    super(dataSource, TestEntity);
  }

  /**
   * create the test database entity from data and block information
   */
  createEntity = (
    boxes: AbstractEntityData[],
    block: BlockInfo,
    extractor: string,
  ): Omit<AbstractErgoEntity, 'id'>[] => {
    return boxes.map((box) => ({
      identifier: box.identifier,
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
    entities: AbstractErgoEntity[],
  ): AbstractEntityData[] => {
    return entities.map((data) => pick(data, ['identifier', 'serialized']));
  };
}
