import { AbstractScanner } from './scanner';
import { Block } from '../../interfaces';

abstract class WebSocketScanner<
  TransactionType
> extends AbstractScanner<TransactionType> {
  abstract name: () => string;

  forwardBlock = async (block: Block, transactions: Array<TransactionType>) => {
    const lastSavedBlock = await this.action.getLastSavedBlock();
    if (lastSavedBlock && block.parentHash !== lastSavedBlock.hash) {
      return false;
    }
    return await this.processBlockTransactions(block, transactions);
  };

  backwardBlock = async (block: Block) => {
    await this.forkBlock(block.blockHeight);
  };
}

export { WebSocketScanner };
