import { AbstractErgoBoxAction } from '@rosen-bridge/abstract-extractor';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { BlockInfo } from '@rosen-bridge/scanner-interfaces';

import CommitmentEntity from '../entities/commitmentEntity';
import { ExtractedCommitment } from '../interfaces/extractedCommitment';

class CommitmentAction extends AbstractErgoBoxAction<
  ExtractedCommitment,
  CommitmentEntity
> {
  constructor(dataSource: DataSource, logger?: AbstractLogger) {
    super(dataSource, CommitmentEntity, logger);
  }

  /**
   * Creates the commitment entity from extracted data and block information
   * @param commitments
   * @param block
   * @param extractor
   * @returns the commitment entities (without the id)
   */
  protected createEntity = (
    commitments: ExtractedCommitment[],
    block: BlockInfo,
    extractor: string,
  ): Array<Omit<CommitmentEntity, 'id'>> => {
    return commitments.map((commitment) => ({
      ...commitment,
      block: block.hash,
      height: block.height,
      extractor,
      commitment: commitment.commitment,
      eventId: commitment.eventId,
      WID: commitment.WID,
      rwtCount: commitment.rwtCount,
    }));
  };

  /**
   * Converts the database entity back to raw data
   * @param entities
   * @returns the extracted collateral data
   */
  protected convertEntityToData = (
    entities: CommitmentEntity[],
  ): ExtractedCommitment[] => {
    return entities;
  };
}

export default CommitmentAction;
