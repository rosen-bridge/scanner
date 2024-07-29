import { AbstractScanner } from './scanner';
import { Block } from '../../interfaces';
import { Mutex } from 'await-semaphore';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';

const DEFAULT_MAX_TRY_BLOCK = 10;

abstract class WebSocketScanner<
  TransactionType
> extends AbstractScanner<TransactionType> {
  readonly maxTryBlock: number;

  protected mutex = new Mutex();

  protected constructor(
    logger?: AbstractLogger,
    maxTryBlock: number = DEFAULT_MAX_TRY_BLOCK
  ) {
    super(logger);
    this.maxTryBlock = maxTryBlock;
  }
  abstract name: () => string;

  abstract start: () => Promise<void>;
  abstract stop: () => Promise<void>;

  protected tryRunningFunction = async (
    fn: () => Promise<boolean>,
    msg: string
  ): Promise<boolean> => {
    for (let tryRound = 1; tryRound <= this.maxTryBlock; tryRound++) {
      if (await fn()) return true;
    }
    this.logger.error(
      `${msg} can not be proceed in ${this.maxTryBlock} try. scanner restarted automatically`
    );
    await this.stop();
    await this.start();
    return false;
  };

  /**
   * Handle new block arrived.
   * save block and its transactions.
   * @param block
   * @param transactions
   */
  stepForward = async (block: Block, transactions: Array<TransactionType>) => {
    const release = await this.mutex.acquire();
    await this.tryRunningFunction(async () => {
      try {
        await this.forkBlock(block.blockHeight);

        const lastSavedBlock = await this.action.getLastSavedBlock();
        if (lastSavedBlock && block.parentHash !== lastSavedBlock.hash) {
          this.logger.error('It seems saved block is not valid in scanner.');
          return false;
        } else {
          await this.verifyExtractorsInitialization({
            height: block.blockHeight - 1,
            hash: block.parentHash,
          });
          const res = await this.processBlockTransactions(block, transactions);
          if (res === false) {
            this.logger.error(
              `Can not process block at height ${block.blockHeight}`
            );
          } else {
            return true;
          }
        }
      } catch (e: any) {
        this.logger.warn(`unknown error occurred ${e}`);
        this.logger.warn(e.stack);
      }
      return false;
    }, `Block at height ${block.blockHeight}`);
    release();
  };

  /**
   * Handle forking a block
   * @param block
   */
  stepBackward = async (block: Block) => {
    const release = await this.mutex.acquire();
    await this.tryRunningFunction(async () => {
      try {
        await this.forkBlock(block.blockHeight + 1);
        return true;
      } catch (e: any) {
        this.logger.error(`unknown error occurred ${e}`);
        this.logger.error(e.stack);
      }
      return false;
    }, `Forking block at height ${block.blockHeight}`);
    release();
  };
}

export { WebSocketScanner };
