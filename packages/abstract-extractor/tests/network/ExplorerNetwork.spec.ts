import { describe, expect, it, vitest } from 'vitest';
import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';
import { omit } from 'lodash-es';

import { ExplorerNetwork } from '../../lib';
import {
  convertedBox,
  explorerBox,
  explorerTxInfo,
  convertedTx,
  explorerTx,
  explorerBlockTx,
} from './testData';

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
      const ergoBox = await explorerNetwork['convertBox'](explorerBox);
      expect(ergoBox).toEqual(convertedBox);
    });
  });

  describe('convertTransaction', () => {
    /**
     * @target convertTransaction should properly convert explorer api tx to
     * extractor transaction
     * @dependencies
     * @scenario
     * - run test (call `convertTransaction`)
     * @expected
     * - to convert tx properly
     */
    it('should properly convert explorer api tx to extractor transaction', async () => {
      const explorerNetwork = new ExplorerNetwork('explorer_url');
      const tx = await explorerNetwork['convertTransaction'](explorerTx);
      expect(tx).toEqual(convertedTx);
    });
  });

  describe('convertBlockTransaction', () => {
    /**
     * @target convertBlockTransaction should properly convert explorer api tx to
     * transaction type
     * @dependencies
     * @scenario
     * - run test (call `convertBlockTransaction`)
     * @expected
     * - to convert tx properly
     */
    it('should properly convert explorer api tx to transaction type', async () => {
      const explorerNetwork = new ExplorerNetwork('explorer_url');
      const tx = await explorerNetwork['convertBlockTransaction'](
        explorerBlockTx
      );
      expect(tx).toEqual(omit(convertedTx, ['blockId', 'inclusionHeight']));
    });
  });
});
