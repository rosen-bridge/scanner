import { RpcNetwork } from '../lib/RpcNetwork';

export class TestEVMRpcNetwork extends RpcNetwork {
  getProvider = () => this.provider;
}
