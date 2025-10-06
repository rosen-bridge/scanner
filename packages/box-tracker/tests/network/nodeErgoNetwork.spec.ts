import { NodeErgoNetwork } from '../../lib/network/nodeErgoNetwork';
import { mockNodeBoxes, mockNodeTxs } from './mock';

vi.mock('@rosen-clients/ergo-node', () => ({
  default: vi.fn(() => ({
    getBoxesByAddress: vi.fn().mockResolvedValue({ items: mockNodeBoxes }),
    getUnconfirmedTransactions: vi.fn().mockResolvedValue(mockNodeTxs),
  })),
}));

describe('NodeErgoNetwork', () => {
  /**
   * @target getMempoolTxs should correctly map unconfirmed transactions
   * @scenario
   * - mock the internal API client to return a transaction with inputs, dataInputs, and outputs
   * - call getMempoolTxs on the NodeErgoNetwork instance
   * @expected
   * - should return an array containing one transaction
   * - transaction id should match 'tx1'
   * - inputs[0].boxId should match 'in1'
   * - dataInputs[0].boxId should match 'data1'
   * - outputs[0].boxId should match 'out1'
   * - outputs[0].assets[0].tokenId should match 't1'
   * - outputs[0].assets[0].amount should equal 10n
   */
  it('should correctly map unconfirmed transactions', async () => {
    const network = new NodeErgoNetwork('someAddress', [], 'bk');
    const txs = await network.getMempoolTxs();
    expect(txs).toHaveLength(1);
    expect(txs[0].id).toBe('tx1');
    expect(txs[0].inputs[0].boxId).toBe('in1');
    expect(txs[0].dataInputs[0].boxId).toBe('data1');
    expect(txs[0].outputs[0].boxId).toBe('out1');
    expect(txs[0].outputs[0].assets[0].tokenId).toBe('t1');
    expect(txs[0].outputs[0].assets[0].amount).toBe(10n);
  });

  /**
   * @target getBox should return the correct box when getBoxesByAddress is mocked
   * @scenario
   * - mock getBoxesByAddress to return a predefined box
   * - call getBox on the NodeErgoNetwork instance
   * @expected
   * - should return the box with the expected boxId from the mock
   */
  it('should return the correct box when getBoxesByAddress is mocked', async () => {
    const network = new NodeErgoNetwork('someAddress', [], 'bk');
    const box = await network.getBox();
    expect(box?.boxId).toBe('b1');
  });
});
