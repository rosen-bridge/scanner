import { Block } from '@rosen-bridge/abstract-extractor';
import { AbstractObservationExtractor, ExtractedObservation } from '../../../lib';

export interface TestTransactionType {
  txId: string;
}

export class TestAbstractObservationExtractor extends AbstractObservationExtractor<TestTransactionType> {
  readonly FROM_CHAIN = 'test-chain';

  getId = () => 'test-observation-extractor';
  getTxId = (tx: TestTransactionType) => tx.txId;
  getRosenExtractor = () => this.extractor;
  callStoreObservations = async (
    observations: Array<ExtractedObservation>,
    block: Block
  ) => this.storeObservations(observations, block);
}
