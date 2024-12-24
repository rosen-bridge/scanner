import { AbstractInitializableErgoExtractor } from './AbstractInitializable';
import { ErgoExtractedData, ExtendedTransaction } from '../interfaces';
import { BlockInfo } from '../../interfaces';
import { ExplorerNetwork } from '../network/ExplorerNetwork';
import { API_LIMIT } from '../../constants';
import { DummyLogger } from '@rosen-bridge/abstract-logger';

export class ExplorerInitializer<ExtractedData extends ErgoExtractedData> {
  private network: ExplorerNetwork;

  constructor(
    private extractor: AbstractInitializableErgoExtractor<ExtractedData>,
    url: string,
    private address: string,
    private logger = new DummyLogger()
  ) {
    this.network = new ExplorerNetwork(url);
  }

  /**
   * Initialize extractor using Explorer network
   * @param initialBlock
   */
  initialize = async (initialBlock: BlockInfo) => {
    let fromHeight = 0,
      toHeight = initialBlock.height;
    while (fromHeight < toHeight) {
      let txs: Array<ExtendedTransaction>;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        txs = await this.network.getAddressTransactionsWithHeight(
          this.address,
          fromHeight,
          toHeight
        );
        this.logger.debug(
          `Found ${txs.length} transactions for the address from height ${fromHeight} to height ${toHeight}`
        );
        if (txs.length < API_LIMIT || fromHeight === toHeight) {
          break; // Exit loop if we have fewer transactions than the limit or if the range is reduced to a single height
        }
        toHeight = Math.floor((toHeight - fromHeight) / 2) + fromHeight;
        this.logger.debug(
          `Limiting the query height range to [${fromHeight}, ${toHeight}]`
        );
      }
      if (txs.length < API_LIMIT) {
        if (txs.length > 0) await this.extractor.processTransactionBatch(txs);
      } else {
        this.logger.debug(
          `Block at height ${fromHeight} has more than (or equal) ${API_LIMIT} relevant txs, processing all txs in the block`
        );
        const blockId = await this.network.getBlockIdAtHeight(fromHeight);
        const blockTxs = await this.network.getBlockTxs(blockId);
        this.logger.debug(
          `Found ${blockTxs.length} transactions at height ${fromHeight}`
        );
        await this.extractor.processTransactions(blockTxs, {
          hash: blockId,
          height: fromHeight,
        });
      }
      fromHeight = toHeight + 1;
      toHeight = initialBlock.height;
    }
  };
}
