import { DeleteResult, MoreThanOrEqual, Repository } from 'typeorm';
import { BlockEntity, PROCEED, PROCESSING } from '../entities/blockEntity';
import {
  Block,
  AbstractNetworkConnector,
  AbstractExtractor,
} from '../interfaces';

export abstract class AbstractScanner<TransactionType> {
  abstract readonly blockRepository: Repository<BlockEntity>;
  abstract readonly initialHeight: number;
  abstract extractors: Array<AbstractExtractor<TransactionType>>;
  abstract networkAccess: AbstractNetworkConnector<TransactionType>;

  abstract name: () => string;

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
  removeForkedBlocks = async (height: number): Promise<DeleteResult> => {
    return await this.blockRepository.delete({
      height: MoreThanOrEqual(height),
      scanner: this.name(),
    });
  };

  /**
   * function that checks if fork is happen in the blockchain or not
   * @return Promise<Boolean>
   */
  isForkHappen = async (): Promise<boolean> => {
    const lastSavedBlock = await this.getLastSavedBlock();
    if (lastSavedBlock !== undefined) {
      const lastSavedBlockFromNetwork =
        await this.networkAccess.getBlockAtHeight(lastSavedBlock.height);
      return lastSavedBlockFromNetwork.hash !== lastSavedBlock.hash;
    } else {
      return false;
    }
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
    const block = await this.getBlockAtHeight(blockHeight, PROCESSING);
    if (block === undefined) {
      return false;
    }
    block.status = PROCEED;
    return await this.blockRepository
      .save(block)
      .then(() => true)
      .catch(() => false);
  };

  /**
   * register a nre extractor to scanner.
   * @param extractor
   */
  registerExtractor = (extractor: AbstractExtractor<TransactionType>): void => {
    if (
      this.extractors.filter(
        (extractorItem) => extractorItem.getId() === extractor.getId()
      ).length === 0
    ) {
      this.extractors.push(extractor);
    }
  };

  /**
   * remove an extractor from scanner
   * @param extractor
   */
  removeExtractor = (extractor: AbstractExtractor<TransactionType>): void => {
    const extractorIndex = this.extractors.findIndex((extractorItem) => {
      return extractorItem.getId() === extractor.getId();
    });
    this.extractors.splice(extractorIndex, 1);
  };

  /**
   * process a block and execute all extractor on it.
   * @param block
   */
  processBlock = async (block: Block) => {
    const savedBlock = await this.saveBlock(block);
    if (typeof savedBlock === 'boolean') {
      return false;
    }
    const txs = await this.networkAccess.getBlockTxs(block.hash);
    let success = true;
    for (const extractor of this.extractors) {
      const extractionResult = await extractor.processTransactions(
        txs,
        savedBlock
      );
      if (!extractionResult) {
        success = false;
        break;
      }
    }
    if (success && (await this.updateBlockStatus(block.blockHeight))) {
      return savedBlock;
    } else {
      return false;
    }
  };

  /**
   * process forward in scanner. get blocks and store information from transactions.
   * @param lastSavedBlock: last saved block entity in database
   */
  stepForward = async (lastSavedBlock: BlockEntity) => {
    const currentHeight = await this.networkAccess.getCurrentHeight();
    if (this.initialHeight >= currentHeight) {
      return;
    }
    for (
      let height = lastSavedBlock.height + 1;
      height <= currentHeight;
      height++
    ) {
      const block = await this.networkAccess.getBlockAtHeight(height);
      if (lastSavedBlock !== undefined) {
        if (block.parentHash === lastSavedBlock?.hash) {
          const savedBlock = await this.processBlock(block);
          if (typeof savedBlock === 'boolean') {
            break;
          } else {
            lastSavedBlock = savedBlock;
          }
        } else {
          break;
        }
      }
    }
  };

  /**
   * Step backward in blockchain and find forkpoint.
   * then remove all forked blocks from database
   * @param lastSavedBlock
   */
  stepBackward = async (lastSavedBlock: BlockEntity) => {
    let forkPoint = lastSavedBlock;
    let forkPointHeight = forkPoint.height;
    let blockFromNetwork = await this.networkAccess.getBlockAtHeight(
      forkPointHeight
    );
    while (
      blockFromNetwork.hash !== forkPoint.hash &&
      blockFromNetwork.parentHash !== forkPoint.parentHash
    ) {
      let block = await this.getBlockAtHeight(forkPointHeight - 1);
      if (block !== undefined && forkPointHeight > this.initialHeight) {
        for (const extractor of this.extractors) {
          try {
            await extractor.forkBlock(forkPoint.hash);
          } catch (e) {
            console.log(
              `An error occured during fork block in extractor ${extractor.getId()}: ${e}`
            );
          }
        }
        forkPointHeight--;
        block = await this.getBlockAtHeight(forkPointHeight - 1);
      }
      if (block !== undefined) {
        forkPoint = block;
        blockFromNetwork = await this.networkAccess.getBlockAtHeight(
          forkPointHeight - 1
        );
      } else {
        break;
      }
    }
    await this.removeForkedBlocks(forkPointHeight);
  };

  /**
   * worker function that runs for syncing the database with the Cardano blockchain and checks if we have any fork
   * scenario in the blockchain and invalidate the database till the database synced again.
   */
  update = async () => {
    try {
      const lastSavedBlock = await this.getLastSavedBlock();
      if (lastSavedBlock === undefined) {
        this.extractors.forEach(extractor => extractor.initializeBoxes())
        const block = await this.networkAccess.getBlockAtHeight(
          this.initialHeight
        );
        await this.processBlock(block);
        return;
      }
      if (!(await this.isForkHappen())) {
        await this.stepForward(lastSavedBlock);
      } else {
        await this.stepBackward(lastSavedBlock);
      }
    } catch (e) {
      console.log(e);
    }
  };
}
