import { pick } from 'lodash-es';

import { DataSource } from '@rosen-bridge/extended-typeorm';
import { BlockInfo } from '@rosen-bridge/scanner-interfaces';

import {
  AbstractErgoAction,
  AbstractErgoEntity,
  AbstractEntityData,
} from '../../../lib';
import { TestEntity } from '../../testUtils';

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
    entities: AbstractEntityData[],
    block: BlockInfo,
    extractor: string,
  ): Omit<AbstractErgoEntity, 'id'>[] => {
    return entities.map((entity) => ({
      identifier: entity.identifier,
      block: block.hash,
      height: block.height,
      serialized: entity.serialized,
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
