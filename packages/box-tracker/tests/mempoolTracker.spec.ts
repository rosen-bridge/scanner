import { MempoolTracker } from '../lib/mempoolTracker';
import { generateTracker } from '../lib/boxHandler';
import { AbstractErgoNetwork } from '../lib/network/abstract/abstractErgoNetwork';
import { ErgoBox } from '../lib/interfaces';

vi.mock('../lib/boxHandler', () => ({
  generateTracker: vi.fn(),
}));

const createMockBox = (boxId: string, value = 100n): ErgoBox => ({
  boxId,
  value,
  ergoTree: 'mockTree',
  creationHeight: 0,
  assets: [],
  additionalRegisters: {},
  transactionId: 'tx-' + boxId,
  index: 0,
});

describe('MempoolTracker', () => {
  const mockNetwork = {
    getMempoolTxs: vi.fn(),
  } as unknown as AbstractErgoNetwork;

  const mockTracker = vi.fn();
  const mempoolTracker = new MempoolTracker(mockNetwork);

  beforeEach(() => {
    vi.clearAllMocks();
    (generateTracker as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      mockTracker,
    );
  });

  /**
   * @target track should return empty arrays when no mempool transactions exist
   * @scenario
   * - mock getMempoolTxs to return an empty array
   * - call track with an address and empty boxes list
   * @expected
   * - should return { boxes: [], spentBoxIds: [] }
   * - generateTracker should be called with the provided address and boxes
   */
  it('should return empty arrays when no mempool transactions exist', async () => {
    mockNetwork.getMempoolTxs = vi.fn().mockResolvedValue([]);

    const result = await mempoolTracker.track('addr', []);
    expect(result).toEqual({ boxes: [], spentBoxIds: [] });
    expect(generateTracker).toHaveBeenCalledWith('addr', []);
  });

  /**
   * @target track should collect spent box IDs from transaction inputs
   * @scenario
   * - mock getMempoolTxs to return a transaction with multiple inputs
   * - mock tracker to always return false (no boxes tracked)
   * @expected
   * - spentBoxIds should include all input boxIds
   * - boxes array should be empty
   */
  it('should collect spent box IDs from transaction inputs', async () => {
    mockNetwork.getMempoolTxs = vi
      .fn()
      .mockResolvedValue([
        { inputs: [{ boxId: 'id1' }, { boxId: 'id2' }], outputs: [] },
      ]);

    mockTracker.mockReturnValue(false);
    const result = await mempoolTracker.track('addr', []);

    expect(result.spentBoxIds).toEqual(['id1', 'id2']);
    expect(result.boxes).toEqual([]);
  });

  /**
   * @target track should filter boxes using the tracker function
   * @scenario
   * - mock getMempoolTxs to return a transaction with inputs and outputs
   * - mock tracker function to select only specific boxes
   * @expected
   * - spentBoxIds should include all inputs
   * - boxes should include only boxes selected by the tracker function
   */
  it('should filter boxes using the tracker function', async () => {
    const mockBox1 = createMockBox('b1');
    const mockBox2 = createMockBox('b2');

    mockNetwork.getMempoolTxs = vi
      .fn()
      .mockResolvedValue([
        { inputs: [{ boxId: 'spent1' }], outputs: [mockBox1, mockBox2] },
      ]);

    mockTracker.mockImplementation((box: ErgoBox) => box.boxId === 'b1');

    const result = await mempoolTracker.track('testAddr', []);

    expect(result.spentBoxIds).toEqual(['spent1']);
    expect(result.boxes).toEqual([mockBox1]);
  });

  /**
   * @target track should handle multiple transactions correctly
   * @scenario
   * - mock getMempoolTxs to return multiple transactions with inputs and outputs
   * - mock tracker function to select specific output boxes from all transactions
   * @expected
   * - spentBoxIds should include all input boxIds from all transactions
   * - boxes should include only boxes selected by the tracker function
   */
  it('should handle multiple transactions correctly', async () => {
    const o1 = createMockBox('o1');
    const o2 = createMockBox('o2');
    const o3 = createMockBox('o3');

    mockNetwork.getMempoolTxs = vi.fn().mockResolvedValue([
      { inputs: [{ boxId: 'a1' }], outputs: [o1, o2] },
      { inputs: [{ boxId: 'a2' }], outputs: [o3] },
    ]);

    mockTracker.mockImplementation(
      (box: ErgoBox) => box.boxId === 'o2' || box.boxId === 'o3',
    );

    const result = await mempoolTracker.track('multiAddr', []);

    expect(result.spentBoxIds).toEqual(['a1', 'a2']);
    expect(result.boxes).toEqual([o2, o3]);
  });
});
