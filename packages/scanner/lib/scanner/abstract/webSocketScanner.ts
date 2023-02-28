import { AbstractScanner } from './scanner';
import { Block } from '../../interfaces';
import { Semaphore } from 'await-semaphore';

const MAX_PROCESS_TRANSACTION = 10;

type QueueType<TransactionType> = {
  block: Block;
  transactions: Array<TransactionType>;
  fork: boolean;
  retriesCount?: number;
};

abstract class WebSocketScanner<
  TransactionType
> extends AbstractScanner<TransactionType> {
  private semaphore = new Semaphore(1);
  private processQueueSemaphore = new Semaphore(1);
  private queue: Array<QueueType<TransactionType>> = [];
  abstract name: () => string;

  abstract start: () => Promise<void>;
  abstract stop: () => Promise<void>;

  /**
   * Insert new block to processing queue
   * @param newBlock
   * @param transactions
   */
  enqueueNewBlock = (newBlock: Block, transactions: Array<TransactionType>) => {
    this.semaphore.acquire().then((release) => {
      const newQueueElement = { block: newBlock, transactions, fork: false };
      let newElementIndex = 0;
      while (
        newElementIndex < this.queue.length &&
        this.queue[newElementIndex].block.blockHeight < newBlock.blockHeight
      ) {
        newElementIndex++;
      }
      if (
        this.queue.length > newElementIndex &&
        this.queue[newElementIndex].block.blockHeight ===
          newQueueElement.block.blockHeight
      ) {
        this.queue[newElementIndex] = newQueueElement;
      } else {
        this.queue = [
          ...this.queue.slice(0, newElementIndex),
          newQueueElement,
          ...this.queue.slice(newElementIndex),
        ];
      }
      release();
    });
  };

  /**
   * Enqueue new fork to processing queue.
   * First remove forked blocks from the queue and then insert fork to the queue.
   * @param lastValidBlock
   */
  enqueueNewFork = (lastValidBlock: Block) => {
    this.semaphore.acquire().then((release) => {
      const newQueueElement = {
        block: lastValidBlock,
        transactions: [],
        fork: false,
      };
      let forkedBlockIndex = 0;
      while (
        forkedBlockIndex < this.queue.length &&
        this.queue[forkedBlockIndex].block.blockHeight <
          lastValidBlock.blockHeight
      ) {
        forkedBlockIndex++;
      }
      this.queue = [...this.queue.slice(0, forkedBlockIndex), newQueueElement];
      release();
    });
  };

  /**
   * process single Queued element.
   * In case of a fork, remove all next blocks and their corresponding extracted content.
   * In case of a new block, store block and extract information from transactions.
   * If any exception happen, rethrow it.
   * @param element
   */
  processElement = async (element: QueueType<TransactionType>) => {
    if (element.fork) {
      this.logger.debug(
        `Processing forked block at height ${element.block.blockHeight}`
      );
      return await this.forkBlock(element.block.blockHeight);
    } else {
      this.logger.debug(
        `Processing new block at height ${element.block.blockHeight}`
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

  /**
   * process block queue elements.
   */
  processQueue = async () => {
    const releaseProcessQueue = await this.processQueueSemaphore.acquire();
    if (this.queue.length > 0) {
      const queuedElement = this.queue[0];
      try {
        await this.processElement(queuedElement);
        const release = await this.semaphore.acquire();
        if (this.queue[0] === queuedElement) {
          this.queue.splice(0, 1);
        }
        if (this.queue.length > 0) {
          // try processing next block asynchronously
          setTimeout(this.processQueue, 100);
        }
        release();
      } catch (e) {
        const logMessage = `Can not process block at height ${queuedElement.block.blockHeight}: ${e}`;
        if (queuedElement.retriesCount == MAX_PROCESS_TRANSACTION) {
          this.logger.error(logMessage);
        } else {
          this.logger.warn(logMessage);
          queuedElement.retriesCount = queuedElement.retriesCount
            ? queuedElement.retriesCount + 1
            : 1;
          this.logger.warn(
            `retrying storing this block in 100 ms... try ${queuedElement.retriesCount}`
          );
          // try processing queue element again
          setTimeout(this.processQueue, 100);
        }
      }
    }
    releaseProcessQueue();
  };

  forwardBlock = async (block: Block, transactions: Array<TransactionType>) => {
    await this.enqueueNewBlock(block, transactions);
    // Running transaction queue asynchronously
    setTimeout(this.processQueue, 100);
  };

  backwardBlock = async (block: Block) => {
    await this.enqueueNewFork(block);
  };
}

export { WebSocketScanner };
