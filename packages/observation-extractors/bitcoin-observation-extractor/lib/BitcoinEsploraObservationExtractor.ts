import { AbstractObservationExtractor } from '@rosen-bridge/observation-extractor';
import { BitcoinEsploraTransaction } from '@rosen-bridge/bitcoin-esplora-scanner';

export class BitcoinEsploraObservationExtractor extends AbstractObservationExtractor<BitcoinEsploraTransaction> {
  readonly FROM_CHAIN = 'bitcoin';

  /**
   * gets Id for current extractor
   */
  getId = () => 'bitcoin-esplora-extractor';

  /**
   * gets transaction id from TransactionType
   */
  getTxId = (tx: BitcoinEsploraTransaction) => tx.txid;
}
