import { pick } from 'lodash-es';

import { AbstractErgoBoxAction } from '@rosen-bridge/abstract-extractor';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { BlockInfo } from '@rosen-bridge/scanner-interfaces';

import { MinFeeBoxEntity } from '../entities/minFeeBoxEntity';
import { ExtractedMinFeeBox } from '../interfaces/extractedMinFeeBox';

export class MinFeeBoxAction extends AbstractErgoBoxAction<
  ExtractedMinFeeBox,
  MinFeeBoxEntity
> {
  constructor(dataSource: DataSource, logger?: AbstractLogger) {
    super(dataSource, MinFeeBoxEntity, logger);
  }

  /**
   * create the box entity from extracted data and block information
   */
  protected createEntity = (
    boxes: ExtractedMinFeeBox[],
    block: BlockInfo,
    extractor: string,
  ): Omit<MinFeeBoxEntity, 'id'>[] => {
    return boxes.map((box) => ({
      identifier: box.identifier,
      serialized: box.serialized,
      token: box.token,
      block: block.hash,
      height: block.height,
      extractor: extractor,
    }));
  };

  /**
   * convert the database entity back to raw data
   */
  protected convertEntityToData = (
    entities: MinFeeBoxEntity[],
  ): ExtractedMinFeeBox[] => {
    return entities.map((entity) =>
      pick(entity, ['identifier', 'serialized', 'token']),
    );
  };
}
