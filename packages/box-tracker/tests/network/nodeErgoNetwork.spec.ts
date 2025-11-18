import { NodeErgoNetwork } from '../../lib/network/nodeErgoNetwork';
import { mockedNodeBoxes, mockedNodeTxs } from './testData';

vi.mock('@rosen-clients/ergo-node', () => ({
  default: vi.fn(() => ({
    getBoxesByAddressUnspent: vi.fn().mockResolvedValue(mockedNodeBoxes),
    getUnconfirmedTransactions: vi.fn().mockResolvedValue(mockedNodeTxs),
    getFullBlockAt: vi.fn().mockResolvedValue(['block-id-1']),
  })),
}));

describe('NodeErgoNetwork', () => {
  let network: NodeErgoNetwork;

  beforeEach(() => {
    network = new NodeErgoNetwork(
      'addr',
      [{ tokenId: 't1', amount: 5n }],
      'url',
    );
  });
  describe('getMempoolTxs', () => {
    /**
     * @target getMempoolTxs should correctly map unconfirmed transactions
     * @scenario
     * - mock the internal API client to return two transactions
     * - first transaction has inputs, dataInputs, and outputs with assets
     * - second transaction has empty inputs/outputs and outputs with empty assets and registers
     * - call getMempoolTxs on the NodeErgoNetwork instance
     * @expected
     * 1. Returns an array containing exactly two transactions.
     * 2. First transaction (`tx1`) mappings:
     *    - `id` matches 'tx1'.
     *    - First input `boxId` matches 'in1'.
     *    - First dataInput `boxId` matches 'data1'.
     *    - First output `boxId` matches 'out1'.
     *    - First output asset tokenId matches 't1'.
     *    - First output asset amount equals 10n.
     *    - First output additionalRegisters is an empty object.
     * 3. Second transaction (`tx2`) mappings:
     *    - `id` matches 'tx2'.
     *    - Inputs and dataInputs are empty arrays.
     *    - First output assets array is empty.
     *    - First output additionalRegisters matches `{ R4: 'val' }`.
     */
    it('should correctly map unconfirmed transactions', async () => {
      const txs = await network.getMempoolTxs();
      expect(txs).toHaveLength(2);

      const [tx1, tx2] = txs;
      expect(tx1.id).toBe('tx1');
      expect(tx1.inputs[0].boxId).toBe('in1');
      expect(tx1.dataInputs[0].boxId).toBe('data1');
      expect(tx1.outputs[0].boxId).toBe('out1');
      expect(tx1.outputs[0].assets[0].tokenId).toBe('t1');
      expect(tx1.outputs[0].assets[0].amount).toBe(10n);
      expect(tx1.outputs[0].additionalRegisters).toEqual({});
      expect(tx2.id).toBe('tx2');
      expect(tx2.inputs).toEqual([]);
      expect(tx2.dataInputs).toEqual([]);
      expect(tx2.outputs[0].assets).toEqual([]);
      expect(tx2.outputs[0].additionalRegisters).toEqual({ R4: 'val' });
    });
  });

  describe('getBoxesByAddress', () => {
    /**
     * @target getBox should return the correct box when getBoxesByAddress is mocked
     * @scenario
     * - mock getBoxesByAddress to return a predefined box
     * - call getBox on the NodeErgoNetwork instance
     * @expected
     * - should return the box with the expected boxId from the mock
     */
    it('should return the correct box when getBoxesByAddress is mocked', async () => {
      const box = await network.getBox();
      expect(box?.boxId).toBe('b1');
    });
    /**
     * @target getBox should return undefined if no box satisfies token requirement
     * @scenario
     * - mock getBoxesByAddress to return a predefined box
     * - call getBox on the NodeErgoNetwork instance
     * @expected
     * - should return undefined
     */
    it('should return undefined if no box satisfies token requirement', async () => {
      const network2 = new NodeErgoNetwork(
        'addr',
        [{ tokenId: 't3', amount: 1n }],
        'url',
      );
      const box = await network2.getBox();
      expect(box).toBeUndefined();
    });
  });
});
