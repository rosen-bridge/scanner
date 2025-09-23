import { DataSource } from '@rosen-bridge/extended-typeorm';
import { BlockInfo } from '@rosen-bridge/scanner-interfaces';
import { pick } from 'lodash-es';

import {
  AbstractErgoBoxEntity,
  AbstractEntityData,
  AbstractErgoBoxAction,
} from '../../../lib';
import { TestBoxEntity } from '../../testUtils';

export class TestErgoBoxAction extends AbstractErgoBoxAction<
  AbstractEntityData,
  AbstractErgoBoxEntity
> {
  constructor(dataSource: DataSource) {
    super(dataSource, TestBoxEntity);
  }

  /**
   * create the test database entity from data and block information
   */
  createEntity = (
    boxes: AbstractEntityData[],
    block: BlockInfo,
    extractor: string,
  ): Omit<AbstractErgoBoxEntity, 'id'>[] => {
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
    entities: AbstractErgoBoxEntity[],
  ): AbstractEntityData[] => {
    return entities.map((data) => pick(data, ['identifier', 'serialized']));
  };
}
