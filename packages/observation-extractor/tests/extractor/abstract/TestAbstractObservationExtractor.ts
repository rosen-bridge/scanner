import { AbstractObservationExtractor } from '../../../lib';

export interface TestTransactionType {
  txId: string;
}

export class TestAbstractObservationExtractor extends AbstractObservationExtractor<TestTransactionType> {
  readonly FROM_CHAIN = 'test-chain';

  getId = () => 'test-observation-extractor';
  getTxId = (tx: TestTransactionType) => tx.txId;
  getRosenExtractor = () => this.extractor;
}
