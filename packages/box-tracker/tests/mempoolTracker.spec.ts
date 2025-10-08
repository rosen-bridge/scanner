import { MempoolTracker } from '../lib/mempoolTracker';
import { generateTracker } from '../lib/boxHandler';
import { AbstractErgoNetwork } from '../lib/network/abstract/abstractErgoNetwork';
import { ErgoBox } from '../lib/interfaces';

vi.mock('../lib/boxHandler', () => ({
  generateTracker: vi.fn(),
}));

// Helper to create a minimal valid ErgoBox
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

  it('returns empty arrays when no mempool transactions exist', async () => {
    mockNetwork.getMempoolTxs = vi.fn().mockResolvedValue([]);

    const result = await mempoolTracker.track('addr', []);
    expect(result).toEqual({ boxes: [], spentBoxIds: [] });
    expect(generateTracker).toHaveBeenCalledWith('addr', []);
  });

  it('collects spent box IDs from inputs', async () => {
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

  it('filters boxes using tracker function', async () => {
    const mockBox1 = createMockBox('b1');
    const mockBox2 = createMockBox('b2');

    mockNetwork.getMempoolTxs = vi.fn().mockResolvedValue([
      {
        inputs: [{ boxId: 'spent1' }],
        outputs: [mockBox1, mockBox2],
      },
    ]);

    mockTracker.mockImplementation((box: ErgoBox) => box.boxId === 'b1');

    const result = await mempoolTracker.track('testAddr', []);

    expect(result.spentBoxIds).toEqual(['spent1']);
    expect(result.boxes).toEqual([mockBox1]);
  });

  it('handles multiple transactions correctly', async () => {
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
