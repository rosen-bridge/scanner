import { TestEvmRpcNetwork } from './testRpcNetwork';

// These tests intentionally do NOT import the mocked JsonRpcProvider used
// by evmRpcNetwork.spec.ts: the timeout lives on the real ethers provider
// connection, so they run against the real ethers implementation.
describe('EvmRpcNetwork timeout', () => {
  /**
   * @target `EvmRpcNetwork` should apply the configured timeout to the
   * provider connection
   * @dependencies
   * @scenario
   * - construct the network with an explicit timeout
   * - read the timeout back from a fresh connection clone
   * @expected
   * - it should equal the configured timeout, not the ethers default
   */
  it('should apply the configured timeout to the provider connection', () => {
    const network = new TestEvmRpcNetwork('http://localhost:8545', 12345);

    expect(network.getProvider()._getConnection().timeout).toEqual(12345);
  });

  /**
   * @target `EvmRpcNetwork` should keep the ethers default timeout when
   * no timeout is configured
   * @dependencies
   * @scenario
   * - construct the network without a timeout
   * - read the timeout back from a fresh connection clone
   * @expected
   * - it should equal the ethers default of 300000 ms
   */
  it('should keep the default timeout when none is configured', () => {
    const network = new TestEvmRpcNetwork('http://localhost:8545');

    expect(network.getProvider()._getConnection().timeout).toEqual(300000);
  });

  /**
   * @target `EvmRpcNetwork` should apply the timeout and keep the auth
   * token in the connection url
   * @dependencies
   * @scenario
   * - construct the network with a timeout and an auth token
   * - read the url and timeout back from a fresh connection clone
   * @expected
   * - the url should end with the auth token
   * - the timeout should equal the configured timeout
   */
  it('should apply the timeout when an auth token is used', () => {
    const network = new TestEvmRpcNetwork(
      'http://localhost:8545',
      5000,
      'secret-token',
    );
    const connection = network.getProvider()._getConnection();

    expect(connection.url).toEqual('http://localhost:8545/secret-token');
    expect(connection.timeout).toEqual(5000);
  });
});
