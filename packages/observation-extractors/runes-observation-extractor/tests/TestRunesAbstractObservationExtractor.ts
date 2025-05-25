import { RunesAbstractObservationExtractor } from '../lib';

export interface TestTransactionType {
  txId: string;
}

export class TestRunesAbstractObservationExtractor extends RunesAbstractObservationExtractor<TestTransactionType> {
  getId = () => 'test-observation-extractor';
  getTxId = (tx: TestTransactionType) => tx.txId;
}
