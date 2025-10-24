import { EvmRpcNetwork } from '../lib/evmRpcNetwork';

export class TestEvmRpcNetwork extends EvmRpcNetwork {
  getProvider = () => this.provider;
}
