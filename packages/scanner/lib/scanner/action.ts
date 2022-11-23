import { BlockEntity, PROCEED, PROCESSING } from '../entities/blockEntity';
import { DataSource, DeleteResult, MoreThanOrEqual, Repository } from 'typeorm';
import { Block } from '../interfaces';

export class BlockDbAction {
  readonly blockRepository: Repository<BlockEntity>;
  readonly scannerName: string;

  constructor(dataSource: DataSource, scannerName: string) {
    this.blockRepository = dataSource.getRepository(BlockEntity);
    this.scannerName = scannerName;
  }

  readonly name = () => this.scannerName;

  /**
   * get last saved block
   * @return Promise<BlockEntity or undefined>
   */
  getLastSavedBlock = async (): Promise<BlockEntity | undefined> => {
    const lastBlock = await this.blockRepository.find({
      where: { status: PROCEED, scanner: this.name() },
      order: { height: 'DESC' },
      take: 1,
    });
    if (lastBlock.length !== 0) {
      return lastBlock[0];
    } else {
      return undefined;
    }
  };

  /**
   * get first saved block
   * @return Promise<BlockEntity or undefined>
   */
  getFirstSavedBlock = async (): Promise<BlockEntity | undefined> => {
    const lastBlock = await this.blockRepository.find({
      where: { status: PROCEED, scanner: this.name() },
      order: { height: 'ASC' },
      take: 1,
    });
    if (lastBlock.length !== 0) {
      return lastBlock[0];
    } else {
      return undefined;
    }
  };

  /**
   * get block hash and height
   * @param height
   * @param status
   * @return Promise<BlockEntity|undefined>
   */
  getBlockAtHeight = async (
    height: number,
    status: string = PROCEED
  ): Promise<BlockEntity | undefined> => {
    const block = await this.blockRepository.findOneBy({
      status: status,
      height: height,
      scanner: this.name(),
    });
    if (block !== null) {
      return block;
    } else {
      return undefined;
    }
  };

  /**
   * it deletes every block that more than or equal height
   * @param height
   * @return Promise<DeleteResult>
   */
  removeBlocksFromHeight = async (height: number): Promise<DeleteResult> => {
    return await this.blockRepository.delete({
      height: MoreThanOrEqual(height),
      scanner: this.name(),
    });
  };

  /**
   * store a block into database.
   * @param block
   */
  saveBlock = async (block: Block): Promise<BlockEntity | boolean> => {
    try {
      const instance = await this.blockRepository.findOneBy({
        height: block.blockHeight,
        scanner: this.name(),
      });
      if (!instance) {
        const row = {
          height: block.blockHeight,
          hash: block.hash,
          parentHash: block.parentHash,
          status: PROCESSING,
          scanner: this.name(),
        };
        await this.blockRepository.insert(row);
      } else {
        await this.blockRepository
          .createQueryBuilder()
          .update()
          .set({
            hash: block.hash,
            parentHash: block.parentHash,
            status: PROCESSING,
            scanner: this.name(),
          })
          .where({
            height: block.blockHeight,
            scanner: this.name(),
          })
          .execute();
      }
      const res = await this.blockRepository.findOneBy({
        height: block.blockHeight,
        scanner: this.name(),
      });
      return res ? res : false;
    } catch (exp) {
      console.error(`An error occurred during save new block: ${exp}`);
      return false;
    }
  };

  /**
   * Update status of a block to proceed
   * @param blockHeight: height of expected block
   */
  updateBlockStatus = async (blockHeight: number): Promise<boolean> => {
    return await this.blockRepository
      .createQueryBuilder()
      .update()
      .set({
        status: PROCEED,
      })
      .where({
        height: blockHeight,
        status: PROCESSING,
        scanner: this.name(),
      })
      .execute()
      .then(() => true)
      .catch(() => false);
  };

  /**
   * Update status of a block to processing in case of fork
   * @param blockHeight: height of expected block
   */
  revertBlockStatus = async (blockHeight: number): Promise<boolean> => {
    return await this.blockRepository
      .createQueryBuilder()
      .update()
      .set({
        status: PROCESSING,
      })
      .where({
        height: blockHeight,
        status: PROCEED,
        scanner: this.name(),
      })
      .execute()
      .then(() => true)
      .catch(() => false);
  };
}
