import { pick } from 'lodash-es';

import { DataSource } from '@rosen-bridge/extended-typeorm';
import { BlockInfo } from '@rosen-bridge/scanner-interfaces';

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

export const testData = [
  {
    identifier: '1',
    extractor: 'target-extractor',
    block: 'created-block-1',
    spendBlock: 'spent-block-1',
    serialized: 'serialized-1',
    height: 100,
  },
  {
    identifier: '2',
    extractor: 'target-extractor',
    block: 'created-block-2',
    spendBlock: 'spent-block-2',
    serialized: 'serialized-2',
    height: 101,
  },
  {
    identifier: '3',
    extractor: 'target-extractor',
    block: 'created-block-3',
    serialized: 'serialized-3',
    spendBlock: null,
    height: 102,
  },
  {
    identifier: '4',
    extractor: 'other-extractor',
    block: 'other-created-block',
    spendBlock: 'other-spent-block',
    serialized: 'other-serialized',
    height: 103,
  },
];
