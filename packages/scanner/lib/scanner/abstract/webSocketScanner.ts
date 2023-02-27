import { AbstractScanner } from './scanner';
import { Block } from '../../interfaces';
import { Semaphore } from 'await-semaphore';

const MAX_PROCESS_TRANSACTION = 10;

type QueueType<TransactionType> = {
  block: Block;
  transactions: Array<TransactionType>;
  fork: boolean;
  proceedCount?: number;
};

abstract class WebSocketScanner<
  TransactionType
> extends AbstractScanner<TransactionType> {
  private semaphore: Semaphore = new Semaphore(1);
  private queue: Array<QueueType<TransactionType>> = [];
  abstract name: () => string;

  abstract start: () => Promise<void>;
  abstract stop: () => Promise<void>;

  insert = (block: Block, transactions: Array<TransactionType>) => {
    this.semaphore.acquire().then((release) => {
      const element = { block, transactions, fork: false };
      let index = 0;
      while (
        index < this.queue.length &&
        this.queue[index].block.blockHeight < block.blockHeight
      ) {
        index++;
      }
      if (
        this.queue.length > index &&
        this.queue[index].block.blockHeight === element.block.blockHeight
      ) {
        this.queue[index] = element;
      } else {
        this.queue = [
          ...this.queue.splice(0, index),
          element,
          ...this.queue.splice(index),
        ];
      }
      release();
    });
  };

  fork = (block: Block) => {
    this.semaphore.acquire().then((release) => {
      const element = { block, transactions: [], fork: false };
      let index: number;
      for (index = 0; index < this.queue.length; index++) {
        if (this.queue[index].block.blockHeight >= block.blockHeight) {
          break;
        }
      }
      this.queue = [...this.queue.slice(0, index), element];
      release();
    });
  };

  processElement = async (element: QueueType<TransactionType>) => {
    if (element.fork) {
      this.logger.debug(
        `Processing fork block at height ${element.block.blockHeight}`
      );
      return await this.forkBlock(element.block.blockHeight);
    } else {
      this.logger.debug(
        `Processing new block  at height ${element.block.blockHeight}`
      );
      const lastSavedBlock = await this.action.getLastSavedBlock();
      if (lastSavedBlock && element.block.parentHash !== lastSavedBlock.hash) {
        throw Error('It seems saved block is not valid in scanner.');
      }
      const res = await this.processBlockTransactions(
        element.block,
        element.transactions
      );
      if (res === false) {
        throw Error(
          `Can not process block at height ${element.block.blockHeight}`
        );
      }
    }
  };

  processQueue = async () => {
    if (this.queue.length > 0) {
      const element = this.queue[0];
      try {
        await this.processElement(element);
        const release = await this.semaphore.acquire();
        if (this.queue[0] === element) {
          this.queue.splice(0, 1);
        }
        if (this.queue.length > 0) {
          // try processing next block asynchronously
          setTimeout(this.processQueue, 100);
        }
        release();
      } catch (e) {
        const logMessage = `Can not process block at height ${element.block.blockHeight}: ${e}`;
        if (element.proceedCount == MAX_PROCESS_TRANSACTION) {
          this.logger.error(logMessage);
        } else {
          this.logger.warn(logMessage);
          this.logger.warn(`retry store this block`);
          element.proceedCount = element.proceedCount
            ? element.proceedCount + 1
            : 1;
          // try processing queue element again
          setTimeout(this.processQueue, 100);
        }
      }
    }
  };

  forwardBlock = async (block: Block, transactions: Array<TransactionType>) => {
    await this.insert(block, transactions);
    // Running transaction queue asynchronously
    setTimeout(this.processQueue, 100);
  };

  backwardBlock = async (block: Block) => {
    await this.fork(block);
  };
}

export { WebSocketScanner };
