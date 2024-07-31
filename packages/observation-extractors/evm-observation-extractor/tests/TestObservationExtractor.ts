import { EvmRpcObservationExtractor } from '../lib';

export class TestEvmRpcObservationExtractor extends EvmRpcObservationExtractor {
  readonly FROM_CHAIN = 'test-chain';

  getId = () => 'test-observation-extractor';
  getRosenExtractor = () => this.extractor;
}
