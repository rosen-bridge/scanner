import { describe, expect, it, vitest } from 'vitest';
import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';

import { ExplorerNetwork } from '../../lib';
import { convertedBox, explorerBox, explorerTxInfo } from './testData';

vitest.mock('@rosen-clients/ergo-explorer');

describe('ExplorerNetwork', () => {
  describe('convertBox', () => {
    /**
     * @target covertBox should properly convert explorer api box to ergo box
     * @dependencies
     * @scenario
     * - mock getApiV1TransactionsP1 to return spending transaction
     * - run test (call `covertBox`)
     * @expected
     * - to convert box properly
     */
    it('should properly convert explorer api box to ergo box', async () => {
      vitest.mocked(ergoExplorerClientFactory).mockReturnValue({
        v1: {
          getApiV1TransactionsP1: async () => explorerTxInfo,
        },
      } as unknown as ReturnType<typeof ergoExplorerClientFactory>);
      const explorerNetwork = new ExplorerNetwork('explorer_url');
      const ergoBox = await explorerNetwork.convertBox(explorerBox);
      expect(ergoBox).toEqual(convertedBox);
    });
  });
});
