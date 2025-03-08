import { DataSource } from 'typeorm';
import { pick } from 'lodash-es';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import {
  AbstractInitializableErgoExtractorAction,
  BlockInfo,
} from '@rosen-bridge/abstract-extractor';

import { BoxEntity } from '../entities/boxEntity';
import { ExtractedBox } from '../interfaces/types';

export class BoxEntityAction extends AbstractInitializableErgoExtractorAction<
  ExtractedBox,
  BoxEntity
> {
  constructor(dataSource: DataSource, logger?: AbstractLogger) {
    super(dataSource, BoxEntity, logger);
  }

  /**
   * create the box entity from extracted data and block information
   */
  createEntity = (
    boxes: ExtractedBox[],
    block: BlockInfo,
    extractor: string
  ): Omit<BoxEntity, 'id'>[] => {
    return boxes.map((box) => ({
      address: box.address,
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
  convertEntityToData = (entities: BoxEntity[]): ExtractedBox[] => {
    return entities.map((data) =>
      pick(data, ['boxId', 'address', 'serialized'])
    );
  };
}
