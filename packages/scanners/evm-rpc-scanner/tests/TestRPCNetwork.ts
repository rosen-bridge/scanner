import { RPCNetwork } from '../lib/RPCNetwork';

export class TestEVMRPCNetwork extends RPCNetwork {
  getProvider = () => this.provider;
}
