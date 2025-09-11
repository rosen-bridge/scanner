import { BitcoinRunesAbstractObservationExtractor } from '../lib';

export interface TestTransactionType {
  txId: string;
}

export class TestBitcoinRunesAbstractObservationExtractor extends BitcoinRunesAbstractObservationExtractor<TestTransactionType> {
  getId = () => 'test-observation-extractor';
  getTxId = (tx: TestTransactionType) => tx.txId;
  callGetTxOutputRunes = this.getTxOutputRunes;
}
