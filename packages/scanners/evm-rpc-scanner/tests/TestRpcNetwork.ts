import { RpcNetwork } from '../lib/RpcNetwork';

export class TestEvmRpcNetwork extends RpcNetwork {
  getProvider = () => this.provider;
}
