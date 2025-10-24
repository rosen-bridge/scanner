import { ExplorerErgoNetwork } from '../../lib/network/explorerErgoNetwork';
import { mockedExplorerBoxes, mockedExplorerTxs } from './testData';

vi.mock('@rosen-clients/ergo-explorer', () => ({
  default: vi.fn(() => ({
    v1: {
      getApiV1BoxesByaddressP1: vi
        .fn()
        .mockResolvedValue({ items: mockedExplorerBoxes }),
    },
    v0: {
      getApiV0TransactionsUnconfirmed: vi
        .fn()
        .mockResolvedValue({ items: mockedExplorerTxs }),
    },
  })),
}));

describe('ExplorerErgoNetwork', () => {
  let network: ExplorerErgoNetwork;
  beforeEach(() => {
    network = new ExplorerErgoNetwork(
      'someAddress',
      [{ tokenId: 't1', amount: 5n }],
      'bk',
    );
  });
  describe('getMempoolTxs', () => {
    /**
     * @target getMempoolTxs should correctly map unconfirmed transactions
     * @scenario
     * - mock the internal API client to return two transactions
     * - first transaction has inputs, dataInputs, and outputs with assets
     * - second transaction has empty inputs/outputs and outputs with empty assets and registers
     * - call getMempoolTxs on the ExplorerErgoNetwork instance
     * @expected
     * - should return an array containing two transactions
     * - first transaction id should match 'tx1'
     * - inputs[0].boxId should match 'in1'
     * - dataInputs[0].boxId should match 'data1'
     * - outputs[0].boxId should match 'out1'
     * - outputs[0].assets[0].tokenId should match 't1'
     * - outputs[0].assets[0].amount should equal 10n
     * - outputs[0].additionalRegisters should be an empty object
     * - second transaction should have empty inputs and dataInputs
     * - second transaction output assets should be empty
     * - second transaction output additionalRegisters should match { R4: 'val' }
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
      const network2 = new ExplorerErgoNetwork(
        'someAddress',
        [{ tokenId: 't3', amount: 1n }],
        'bk',
      );
      const box = await network2.getBox();
      expect(box).toBeUndefined();
    });
  });
});
