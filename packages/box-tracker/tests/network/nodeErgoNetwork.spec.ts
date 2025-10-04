import { NodeErgoNetwork } from '../../lib/network/nodeErgoNetwork';

vi.mock('@rosen-clients/ergo-node', () => {
  return {
    default: vi.fn(() => ({
      getBoxesByAddress: vi.fn(async () => ({ items: [] })),
      getUnconfirmedTransactions: vi.fn(async () => []),
    })),
  };
});

describe('NodeErgoNetwork', () => {
  it('should mock getBoxesByAddress', async () => {
    const network = new NodeErgoNetwork(
      'addr',
      [{ tokenId: 't1', amount: 5n }],
      'fake-url',
    );

    vi.spyOn(
      network as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      'getBoxesByAddress',
    ).mockResolvedValue([
      {
        boxId: 'b1',
        value: 1000n,
        ergoTree: 'tree',
        creationHeight: 1,
        assets: [{ tokenId: 't1', amount: 5n }],
        additionalRegisters: {},
        transactionId: 'tx1',
        index: 0,
      },
    ]);

    const box = await network.getBox();
    expect(box?.boxId).toBe('b1');
  });

  it('should mock getMempoolTxs', async () => {
    const network = new NodeErgoNetwork('addr', [], 'fake-url');

    (network as any).api = // eslint-disable-line @typescript-eslint/no-explicit-any
      {
        getBoxesByAddress: async () => ({ items: [] }),
        getUnconfirmedTransactions: async () => [
          {
            id: 'tx1',
            inputs: [{ boxId: 'in1' }],
            dataInputs: [{ boxId: 'data1' }],
            outputs: [
              {
                boxId: 'out1',
                value: '500',
                ergoTree: 'tree',
                creationHeight: 100,
                assets: [{ tokenId: 't1', amount: '10' }],
                additionalRegisters: {},
                transactionId: 'tx1',
                index: 0,
              },
            ],
          },
        ],
      };

    const txs = await network.getMempoolTxs();
    expect(txs).toHaveLength(1);
    expect(txs[0].id).toBe('tx1');
    expect(txs[0].inputs[0].boxId).toBe('in1');
    expect(txs[0].dataInputs[0].boxId).toBe('data1');
    expect(txs[0].outputs[0].boxId).toBe('out1');
    expect(txs[0].outputs[0].assets[0].tokenId).toBe('t1');
    expect(txs[0].outputs[0].assets[0].amount).toBe(10n);
  });
});
