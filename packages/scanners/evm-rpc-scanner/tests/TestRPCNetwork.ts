import { RPCNetwork } from '../lib/network/rpc';

export class TestCardanoBlockFrostNetwork extends RPCNetwork {
  getProvider = () => this.provider;
}
