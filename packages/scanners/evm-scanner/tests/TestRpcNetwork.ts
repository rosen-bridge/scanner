import { EvmRpcNetwork } from '../lib/EvmRpcNetwork';

export class TestEvmRpcNetwork extends EvmRpcNetwork {
  getProvider = () => this.provider;
}
