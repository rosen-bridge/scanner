import { ExplorerErgoNetwork } from '../../lib/network/explorerErgoNetwork';

vi.mock('@rosen-clients/ergo-explorer', () => {
  return {
    default: vi.fn(() => ({
      v1: {
        getApiV1BoxesByaddressP1: vi.fn(async () => ({ items: [] })),
      },
      v0: {
        getApiV0TransactionsUnconfirmed: vi.fn(async () => ({ items: [] })),
      },
    })),
  };
});

describe('ExplorerErgoNetwork', () => {
  it('should mock getBoxesByAddress only', async () => {
    const network = new ExplorerErgoNetwork('addr', [], 'fake-url');

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
    const network = new ExplorerErgoNetwork('addr', [], 'fake-url');

    (network as any).api = // eslint-disable-line @typescript-eslint/no-explicit-any
      {
        v1: {
          getApiV1BoxesByaddressP1: async () => ({ items: [] }),
        },
        v0: {
          getApiV0TransactionsUnconfirmed: async () => ({
            items: [
              {
                id: 'tx1',
                inputs: [{ id: 'in1' }],
                dataInputs: [{ id: 'data1' }],
                outputs: [
                  {
                    id: 'out1',
                    value: '500',
                    ergoTree: 'tree',
                    creationHeight: 100,
                    assets: [{ tokenId: 't1', amount: '10' }],
                    additionalRegisters: {},
                    txId: 'tx1',
                    index: 0,
                  },
                ],
              },
            ],
          }),
        },
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
